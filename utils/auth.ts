import crypto from 'crypto';
import bcrypt from 'bcryptjs/dist/bcrypt.js';

// Admin whitelist - hardcoded allowed emails
export const ADMIN_WHITELIST = [
  'admin@example.com',
  'test.admin@electra.com',
  'admin@electra.com',
];

/**
 * Validates if an email is in the admin whitelist
 */
export function isAdminEmailAllowed(email: string): boolean {
  return ADMIN_WHITELIST.some(
    (allowedEmail) => allowedEmail.toLowerCase() === email.toLowerCase()
  );
}

/**
 * Generates a secure password reset token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash the master key using bcrypt (for secure storage)
 */
export async function hashMasterKey(masterKey: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(masterKey, saltRounds);
}

/**
 * Verify master key against hashed version
 */
export async function verifyMasterKey(
  providedKey: string,
  hashedKey: string
): Promise<boolean> {
  return bcrypt.compare(providedKey, hashedKey);
}

/**
 * Encrypt sensitive data (for additional layer of security)
 * Uses AES-256-GCM encryption
 */
export function encryptData(
  data: string,
  encryptionKey: string
): { encrypted: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt encrypted data
 */
export function decryptData(
  encrypted: string,
  iv: string,
  authTag: string,
  encryptionKey: string
): string {
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Validates password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if password reset token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
