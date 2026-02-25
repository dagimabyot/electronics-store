import { supabase } from './supabase';
import {
  generateResetToken,
  hashMasterKey,
  verifyMasterKey,
  isAdminEmailAllowed,
  validateEmail,
} from '@/utils/auth';

const PASSWORD_RESET_EXPIRY_HOURS = 1;

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  isAdmin: boolean = false
) {
  try {
    // Check if email exists in database
    const userType = isAdmin ? 'admins' : 'profiles';
    const { data: user, error: checkError } = await supabase
      .from(userType)
      .select('email')
      .eq('email', email)
      .single();

    if (checkError || !user) {
      console.error(`[v0] User not found: ${email}`);
      return {
        success: false,
        message: 'Email not found in our records',
      };
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000);

    // Store reset token in database
    const { error: insertError } = await supabase
      .from('password_resets')
      .insert({
        email,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('[v0] Failed to store reset token:', insertError);
      return {
        success: false,
        message: 'Failed to process password reset request',
      };
    }

    // In production, send actual email here
    // For now, log the reset link for development
    const fullResetLink = `${resetLink}?token=${resetToken}&email=${encodeURIComponent(email)}`;
    console.log('[v0] Password reset link:', fullResetLink);

    return {
      success: true,
      message: 'Password reset link has been sent to your email',
      resetToken, // Only for development/testing
    };
  } catch (error) {
    console.error('[v0] Error in sendPasswordResetEmail:', error);
    return {
      success: false,
      message: 'An error occurred while processing your request',
    };
  }
}

/**
 * Verify password reset token
 */
export async function verifyResetToken(token: string, email: string) {
  try {
    const { data: resetRecord, error } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .single();

    if (error || !resetRecord) {
      return {
        valid: false,
        message: 'Invalid or expired reset link',
      };
    }

    // Check if token is expired
    const expiresAt = new Date(resetRecord.expires_at);
    if (new Date() > expiresAt) {
      return {
        valid: false,
        message: 'Reset link has expired',
      };
    }

    // Check if token has already been used
    if (resetRecord.used_at) {
      return {
        valid: false,
        message: 'This reset link has already been used',
      };
    }

    return {
      valid: true,
      message: 'Reset token is valid',
      resetRecord,
    };
  } catch (error) {
    console.error('[v0] Error verifying reset token:', error);
    return {
      valid: false,
      message: 'An error occurred while verifying your reset link',
    };
  }
}

/**
 * Update password using reset token
 */
export async function resetPasswordWithToken(
  token: string,
  email: string,
  newPassword: string,
  isAdmin: boolean = false
) {
  try {
    // Verify token first
    const tokenVerification = await verifyResetToken(token, email);
    if (!tokenVerification.valid) {
      return {
        success: false,
        message: tokenVerification.message,
      };
    }

    // Update password in auth system via Supabase
    // Note: This uses Supabase Auth API to update the user password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('[v0] Error updating password:', updateError);
      return {
        success: false,
        message: 'Failed to update password',
      };
    }

    // Mark token as used
    const { error: markUsedError } = await supabase
      .from('password_resets')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)
      .eq('email', email);

    if (markUsedError) {
      console.error('[v0] Error marking token as used:', markUsedError);
    }

    return {
      success: true,
      message: 'Password has been successfully reset',
    };
  } catch (error) {
    console.error('[v0] Error in resetPasswordWithToken:', error);
    return {
      success: false,
      message: 'An error occurred while resetting your password',
    };
  }
}

/**
 * Register a new admin (requires master key and email whitelist validation)
 */
export async function registerAdmin(
  email: string,
  password: string,
  masterKey: string,
  providedMasterKey: string
) {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      return {
        success: false,
        message: 'Invalid email format',
      };
    }

    // Check if email is in admin whitelist
    if (!isAdminEmailAllowed(email)) {
      return {
        success: false,
        message: 'Email is not authorized for admin access',
      };
    }

    // Verify master key
    const masterKeyValid = await verifyMasterKey(providedMasterKey, masterKey);
    if (!masterKeyValid) {
      return {
        success: false,
        message: 'Invalid master key',
      };
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'admin',
        },
      },
    });

    if (authError) {
      console.error('[v0] Auth signup error:', authError);
      return {
        success: false,
        message: 'Failed to create admin account',
      };
    }

    // Add admin to admins table
    if (authData.user) {
      const { error: adminInsertError } = await supabase
        .from('admins')
        .insert({
          email,
        });

      if (adminInsertError) {
        console.error('[v0] Error inserting admin record:', adminInsertError);
        return {
          success: false,
          message: 'Failed to register admin',
        };
      }
    }

    return {
      success: true,
      message: 'Admin account created successfully',
    };
  } catch (error) {
    console.error('[v0] Error in registerAdmin:', error);
    return {
      success: false,
      message: 'An error occurred during registration',
    };
  }
}

/**
 * Get the current active master key hash
 */
export async function getActiveMasterKeyHash() {
  try {
    const { data, error } = await supabase
      .from('master_key_storage')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('[v0] Error fetching master key:', error);
      return null;
    }

    return data?.hashed_key || null;
  } catch (error) {
    console.error('[v0] Error in getActiveMasterKeyHash:', error);
    return null;
  }
}

/**
 * Update master key (requires old key verification)
 */
export async function updateMasterKey(
  oldMasterKey: string,
  newMasterKey: string,
  adminEmail: string
) {
  try {
    // Get current master key
    const currentHashedKey = await getActiveMasterKeyHash();
    if (!currentHashedKey) {
      return {
        success: false,
        message: 'No master key found',
      };
    }

    // Verify old master key
    const oldKeyValid = await verifyMasterKey(oldMasterKey, currentHashedKey);
    if (!oldKeyValid) {
      return {
        success: false,
        message: 'Current master key is incorrect',
      };
    }

    // Hash new master key
    const hashedNewKey = await hashMasterKey(newMasterKey);

    // Mark old key as inactive
    const { error: deactivateError } = await supabase
      .from('master_key_storage')
      .update({ is_active: false })
      .eq('is_active', true);

    if (deactivateError) {
      console.error('[v0] Error deactivating old key:', deactivateError);
      return {
        success: false,
        message: 'Failed to update master key',
      };
    }

    // Insert new master key
    const { error: insertError } = await supabase
      .from('master_key_storage')
      .insert({
        hashed_key: hashedNewKey,
        is_active: true,
      });

    if (insertError) {
      console.error('[v0] Error inserting new master key:', insertError);
      return {
        success: false,
        message: 'Failed to update master key',
      };
    }

    // Log the change
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('email', adminEmail)
      .single();

    if (adminData) {
      await supabase.from('master_key_history').insert({
        admin_id: adminData.id,
        changed_by_email: adminEmail,
        notes: 'Master key updated via settings',
      });
    }

    return {
      success: true,
      message: 'Master key has been successfully updated',
    };
  } catch (error) {
    console.error('[v0] Error in updateMasterKey:', error);
    return {
      success: false,
      message: 'An error occurred while updating the master key',
    };
  }
}
