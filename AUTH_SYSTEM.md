# Secure Authentication System - Documentation

## Overview

This authentication system implements enterprise-grade security with separate flows for customers and administrators, including password reset functionality and strict role-based access control.

## Key Features

### 🔐 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt (12 rounds)
- **Master Key Encryption**: Master key is hashed/encrypted and never exposed on frontend
- **Token-Based Password Reset**: One-time use tokens with 1-hour expiry
- **Re-authentication**: Sensitive operations require password verification
- **Row Level Security (RLS)**: Database-level access control policies
- **Audit Logging**: Master key changes are logged with admin details and timestamps

### 👥 User Roles

1. **Customer**: Regular user accounts for store customers
   - Can register and login with email/password
   - Can reset password via email link
   - Cannot access admin features

2. **Admin**: Restricted administrator accounts
   - Hardcoded email whitelist (only 3 approved emails)
   - Requires valid master key for registration
   - Can manage products, orders, and analytics
   - Can change master key with re-authentication
   - Has access to secure settings panel

## Hardcoded Admin Whitelist

Only the following emails are authorized for admin access:
- `admin@example.com`
- `test.admin@electra.com`
- `admin@electra.com`

All other emails will be rejected during admin login or registration.

## Database Schema

### Tables Created

1. **admins** - Stores approved admin accounts
   ```sql
   id (UUID, Primary Key)
   email (TEXT, Unique)
   created_at (TIMESTAMP)
   updated_at (TIMESTAMP)
   ```

2. **password_resets** - Manages password reset tokens
   ```sql
   id (UUID, Primary Key)
   email (TEXT)
   token (TEXT, Unique)
   expires_at (TIMESTAMP)
   used_at (TIMESTAMP, nullable)
   created_at (TIMESTAMP)
   ```

3. **master_key_storage** - Stores hashed master keys
   ```sql
   id (UUID, Primary Key)
   hashed_key (TEXT, Unique)
   created_at (TIMESTAMP)
   updated_at (TIMESTAMP)
   is_active (BOOLEAN)
   ```

4. **master_key_history** - Audit log for master key changes
   ```sql
   id (UUID, Primary Key)
   admin_id (UUID, Foreign Key)
   changed_by_email (TEXT)
   changed_at (TIMESTAMP)
   notes (TEXT, nullable)
   ```

## Password Reset Flow

### For Customers

1. Click "Forgot password?" on customer login
2. Enter email address
3. System generates secure token (32-byte random hash)
4. Token stored in `password_resets` table with 1-hour expiry
5. Reset link sent to email (development: logged to console)
6. User clicks link and is directed to `/reset-password?token=XXX&email=YYY`
7. User enters new password (must meet security requirements)
8. Token verified, password updated, token marked as used
9. User redirected to login page

### For Admins

Same flow as customers but:
- Accessed via `Forgot Password?` button on admin login
- Reset link goes to `/admin/reset-password`
- Email whitelist validation occurs on token verification

## Admin Registration

### Requirements

- Email must be in hardcoded whitelist
- Valid master key required
- Password must meet security standards:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (!@#$%^&*)

### Process

1. Potential admin clicks "Admin" tab on login
2. Clicks "Create Account" link
3. Fills registration form (email, password, master key)
4. System validates:
   - Email format
   - Email in whitelist
   - Password strength
   - Master key matches stored hash
5. If all valid, creates auth user and adds to `admins` table
6. Returns success message

## Master Key Management

### Initial Setup

Master key must be initialized in the database with a hashed value:

```javascript
const { hashMasterKey } = require('@/utils/auth');
const hashedKey = await hashMasterKey('your-master-key');
// Insert into master_key_storage table
```

### Changing Master Key

Admin can change master key via Settings panel:

1. Click Settings (⚙️) in admin header
2. Go to "Master Key Management" tab
3. System prompts for re-authentication
4. Admin enters current master key
5. Admin enters new master key
6. System verifies old key matches
7. Old key deactivated, new key activated
8. Change logged to audit table
9. Success message displayed

### Security Notes

- Master key is **never** displayed on frontend
- Only the hash is stored in database
- Changes require re-authentication
- All changes are audit logged
- Only one active master key at a time

## API Services

### Authentication Service (`services/authService.ts`)

- `sendPasswordResetEmail()` - Initiates password reset flow
- `verifyResetToken()` - Validates reset token
- `resetPasswordWithToken()` - Updates password
- `registerAdmin()` - Creates new admin account
- `getActiveMasterKeyHash()` - Retrieves current master key
- `updateMasterKey()` - Changes master key with verification

### Utility Functions (`utils/auth.ts`)

- `isAdminEmailAllowed()` - Checks email whitelist
- `generateResetToken()` - Creates secure token
- `hashMasterKey()` - Hashes master key for storage
- `verifyMasterKey()` - Compares plaintext with hash
- `encryptData()` - AES-256-GCM encryption (optional)
- `decryptData()` - AES-256-GCM decryption (optional)
- `validatePasswordStrength()` - Checks password requirements
- `validateEmail()` - Validates email format
- `isTokenExpired()` - Checks token expiry

## Components

### ForgotPasswordModal
- Email input for password reset
- Error and success messages
- Works for both customers and admins

### AdminLoginModal
- Email and password fields
- Email whitelist validation
- "Forgot Password?" link
- Clear security messaging

### AdminSignupModal
- Email, password, and master key inputs
- Password strength validator
- Email whitelist validation
- Master key verification

### AdminSettings
- Security & Password tab
- Master Key Management tab
- Re-authentication requirement
- Audit logging

### AdminPortal
- Main admin interface
- Login/logout functionality
- Settings access
- Dashboard display

## Pages

- `/reset-password` - Customer password reset
- `/admin/login` - Admin login page
- `/admin/reset-password` - Admin password reset
- `/admin/dashboard` - Admin control panel

## Usage Examples

### Reset Customer Password

```typescript
import { sendPasswordResetEmail } from '@/services/authService';

const response = await sendPasswordResetEmail(
  'customer@example.com',
  'https://myapp.com/reset-password',
  false // isAdmin = false
);
```

### Register New Admin

```typescript
import { registerAdmin } from '@/services/authService';

const response = await registerAdmin(
  'admin@example.com',
  'SecurePassword123!',
  hashedMasterKeyFromDB,
  'plaintext-master-key'
);
```

### Validate Master Key

```typescript
import { verifyMasterKey } from '@/utils/auth';

const isValid = await verifyMasterKey(
  providedKey,
  hashedKeyFromDB
);
```

## Security Best Practices

1. **Never log passwords** - Only log password changes
2. **Hash sensitive data** - Master key and passwords are hashed
3. **Token expiry** - Reset tokens expire after 1 hour
4. **One-time tokens** - Each token can only be used once
5. **Email validation** - All email addresses are verified
6. **Re-authentication** - Critical operations require password
7. **Audit logging** - Master key changes are logged
8. **Error messages** - Avoid leaking sensitive information
9. **HTTPS only** - All communication should use HTTPS in production
10. **Secure cookies** - Session cookies should be HTTP-only

## Development Notes

- Reset emails are logged to console in development
- Test with the three hardcoded admin emails
- Master key must be initialized before admin registration
- RLS policies should be enabled on all tables
- Use environment variables for sensitive configuration

## Testing

### Test Customer Reset
1. Create customer account
2. Click "Forgot password?"
3. Enter email
4. Check console for reset link
5. Click link and reset password
6. Login with new password

### Test Admin Access
1. Try login with non-whitelisted email → Should be denied
2. Try registration without master key → Should fail
3. Try registration with wrong master key → Should fail
4. Register with correct credentials → Should succeed
5. Login as admin → Should access dashboard

### Test Master Key Change
1. Login as admin
2. Click settings
3. Try changing master key
4. Verify re-authentication required
5. Check audit log in database

## Troubleshooting

**Q: Reset email not received**
- In dev: Check browser console logs
- In prod: Ensure email service is configured
- Check database for reset record

**Q: Admin registration fails**
- Verify email is in whitelist
- Check master key is correct
- Ensure password meets requirements

**Q: Can't change master key**
- Verify current master key is correct
- Check database has active master key
- Ensure re-authentication passed

**Q: RLS policy errors**
- Verify RLS is enabled on tables
- Check policies are created
- Ensure user has correct role

## Support

For issues or questions about the authentication system, refer to:
- Supabase documentation: https://supabase.com/docs
- Auth.js documentation: https://authjs.dev
- Security best practices: https://owasp.org/
