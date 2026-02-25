# Secure Authentication System - Complete Setup Guide

## 🚀 Quick Start Overview

This guide walks you through setting up the complete authentication system with:
- Customer and Admin separate login flows
- Password reset functionality for both roles
- Hardcoded admin email whitelist
- Master key management system
- Re-authentication for sensitive operations
- Audit logging for security events

## Prerequisites

- ✅ Supabase project connected
- ✅ Node.js 18+ installed
- ✅ Environment variables configured:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `bcryptjs` package (automatically installed)

---

## Step 1: Create Database Tables

### Execute the Migration

The migration script creates all necessary tables with Row Level Security (RLS) policies.

**Option A: Using Supabase Dashboard**

1. Navigate to: [Supabase SQL Editor](https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new)
2. Click "New Query"
3. Copy the entire content from `/scripts/create_auth_tables.sql`
4. Paste into the editor
5. Click "Run" (blue button)
6. Expected: "Query executed successfully"

**Option B: Using Migration Script**

```bash
# Ensure env variables are set
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-key"

# Run migration
node scripts/migrate-auth.js
```

### Tables Created

```
✓ admins - Admin account registry
✓ password_resets - Password reset token management
✓ master_key_storage - Hashed master keys
✓ master_key_history - Audit log for key changes
```

---

## Step 2: Initialize Master Key

The master key is required for admin registration. It must be initialized once in the database.

### Run Initialization Script

```bash
# Method 1: With environment variable
export ADMIN_MASTER_KEY="your-very-secure-master-key-here"
node scripts/init-master-key.js

# Method 2: Edit script directly and run
node scripts/init-master-key.js
```

### Expected Output

```
[v0] Initializing master key...
[v0] Master Key: SECU...
[v0] Master key hashed successfully
[v0] ✓ Master key initialized successfully!
[v0] Master Key ID: 550e8400-e29b-41d4-a716-446655440000
[v0] Created at: 2024-02-25T10:30:00Z

[v0] ⚠️  IMPORTANT:
[v0] 1. Store this master key in a secure location: your-very-secure-master-key-here
[v0] 2. Share it with authorized admins only
[v0] 3. Admins will need this key to register
[v0] 4. Master key can be changed via Admin Settings
```

### ⚠️ CRITICAL: Save the Master Key

- Store in password manager
- Never commit to git
- Share only with authorized admins
- Use strong, random value (30+ characters recommended)

---

## Step 3: Configure Admin Whitelist

### Current Authorized Admins

Only these three emails can register as admins:
```
✓ admin@example.com
✓ test.admin@electra.com
✓ admin@electra.com
```

### To Modify the Whitelist

1. Open `/utils/auth.ts`
2. Find `ADMIN_WHITELIST` constant:
   ```typescript
   export const ADMIN_WHITELIST = [
     'admin@example.com',
     'test.admin@electra.com',
     'admin@electra.com',
     // Add your admins here
   ];
   ```
3. Add/remove emails as needed
4. Redeploy application

### Production Whitelist

For production, update to your actual admin emails:
```typescript
export const ADMIN_WHITELIST = [
  'alice@company.com',
  'bob@company.com',
  'security@company.com',
];
```

---

## Step 4: Test Customer Authentication

### Customer Registration

1. Open your app homepage
2. In the auth modal, select **"Customer"** tab
3. Click **"Sign up"**
4. Fill in form:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Password: `SecurePass123!` (must have uppercase, lowercase, number, special char)
5. Click **"Create Account"**
6. See success message: "Account created! Verification email sent..."

### Customer Password Reset

1. Go to login and select **"Customer"** tab
2. Click **"Forgot password?"**
3. Enter email: `john@example.com`
4. **In Development**: Check browser console for reset link
   - Open DevTools (F12)
   - Find message: `[v0] Password reset link: https://...?token=XXX...`
5. Copy the reset link, open in new tab
6. Enter new password: `NewSecurePass456!`
7. Click **"Reset Password"**
8. Redirected to login page
9. Login with new password

---

## Step 5: Test Admin Authentication

### Admin Registration (First Time Only)

1. Navigate to `/admin/login` page
2. Click **"Admin"** tab (red color)
3. Click **"Sign up"** or see signup prompt
4. Fill registration form:
   - **Email**: `admin@example.com` (must be in whitelist)
   - **Password**: `AdminPass123!` (strong password)
   - **Confirm Password**: `AdminPass123!`
   - **Master Key**: Paste the master key from Step 2
5. Click **"Register Admin"**
6. See success: "✓ Admin account created successfully!"

### Testing Email Validation

Try with unauthorized email:
- Email: `hacker@example.com`
- Expected Error: "❌ This email is not authorized for admin registration"

### Testing Master Key Validation

Try with wrong master key:
- Email: `admin@example.com`
- Master Key: `wrong-key`
- Expected Error: "❌ Invalid master key"

### Admin Login

1. Go to `/admin/login`
2. Enter:
   - Email: `admin@example.com`
   - Password: `AdminPass123!`
3. Click **"Admin Login"**
4. Should see admin dashboard with:
   - System Status header
   - Product Management tab
   - Orders tab
   - Analytics tab
   - System tab (with master key info)
5. Click ⚙️ (Settings) to access admin settings

### Admin Password Reset

1. On admin login page, click **"Forgot Password?"**
2. Enter admin email: `admin@example.com`
3. In development: Check console for reset link
4. Click link and enter new password
5. Click **"Reset Password"**
6. Login with new credentials

---

## Step 6: Test Admin Settings

### Access Settings Panel

1. Login as admin
2. Click ⚙️ icon in top-right header
3. Settings panel opens with two tabs

### Security & Password Tab

- Shows admin email
- Instructions to change password
- Button to trigger password reset flow
- Click "Reset Password" to use forgot password feature

### Master Key Management Tab

1. Click **"Proceed with Change"** button
2. System prompts for re-authentication:
   - Enter admin password
   - Click "Verify"
3. Once authenticated, fill in:
   - **Current Master Key**: Original master key value
   - **New Master Key**: New secure value
   - **Confirm Master Key**: Repeat new value
4. Click **"Update Master Key"**
5. See success message: "✓ Master key has been successfully updated"
6. Change is logged to audit table with timestamp and admin email

### Verify Master Key Change

Try registering new admin with old master key:
- Should fail: "❌ Invalid master key"

Try with new master key:
- Should succeed (if other requirements met)

---

## Step 7: Verify Database Security

### Check RLS is Enabled

In Supabase Dashboard → SQL Editor, run:

```sql
SELECT table_name, row_level_security 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admins', 'password_resets', 'master_key_storage', 'master_key_history');
```

**Expected Result:**
```
table_name                | row_level_security
------------------------+-------------------
admins                   | true
password_resets          | true
master_key_storage       | true
master_key_history       | true
```

### View RLS Policies

1. In Supabase Dashboard → Table Editor
2. Select "admins" table
3. Click "RLS" button (top right)
4. Should see active policies listed

---

## Step 8: Production Deployment Checklist

Before deploying to production:

- [ ] Master key is stored in environment variables
- [ ] Admin whitelist is updated with production emails
- [ ] RLS policies are enabled on all tables
- [ ] HTTPS is enforced for all connections
- [ ] Email service is configured (SendGrid, Mailgun, AWS SES)
- [ ] Password reset emails are being sent
- [ ] Admin settings are accessible only to authenticated admins
- [ ] Audit logs are being written to database
- [ ] Session timeout is configured appropriately
- [ ] Rate limiting is enabled on auth endpoints
- [ ] Database backups are scheduled daily
- [ ] Monitoring alerts are set up for failed logins
- [ ] Two-factor authentication is considered for admins
- [ ] Admin actions are logged and reviewed regularly

---

## Email Configuration (Production)

For password reset emails to work in production:

### Option 1: SendGrid (Recommended)

```typescript
// services/emailService.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendPasswordResetEmail(email, resetLink) {
  await sgMail.send({
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: 'Reset Your Password',
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `,
  });
}
```

### Option 2: AWS SES

```typescript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: process.env.AWS_REGION });

export async function sendPasswordResetEmail(email, resetLink) {
  await sesClient.send(new SendEmailCommand({
    Source: process.env.SENDER_EMAIL,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Reset Your Password' },
      Body: { Html: { Data: `<a href="${resetLink}">Reset Password</a>` } },
    },
  }));
}
```

---

## File Reference

### Core Files

```
utils/
  └── auth.ts                     # 138 lines - Auth utilities
services/
  └── authService.ts              # 378 lines - Database operations
components/
  ├── ForgotPasswordModal.tsx      # 147 lines - Password reset UI
  ├── AdminLoginModal.tsx          # 159 lines - Admin login UI
  ├── AdminSignupModal.tsx         # 245 lines - Admin registration UI
  ├── AdminSettings.tsx            # 348 lines - Admin settings panel
  └── AdminPortal.tsx              # 160 lines - Admin dashboard wrapper
pages/
  ├── reset-password/page.tsx      # 200 lines - Customer password reset
  └── admin/
      ├── login/page.tsx           # 31 lines - Admin login page
      ├── reset-password/page.tsx   # 200 lines - Admin password reset
      └── dashboard/page.tsx        # 8 lines - Admin dashboard

scripts/
  ├── create_auth_tables.sql       # Database migration
  ├── init-master-key.js           # Master key initialization
  └── migrate-auth.js              # Node migration runner

docs/
  ├── AUTH_SYSTEM.md               # Full documentation
  └── AUTH_SETUP_GUIDE.md          # This file
```

---

## Troubleshooting

### Master Key Issues

**Q: Init script says "Missing Supabase credentials"**
```bash
# Solution: Set environment variables first
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"
node scripts/init-master-key.js
```

**Q: "Master key not found" during admin registration**
- Run `node scripts/init-master-key.js` to initialize
- Verify table exists in Supabase

**Q: Can't change master key in admin settings**
- Verify current master key is typed correctly
- Check that re-authentication succeeded
- Ensure user is authenticated admin

### Admin Registration

**Q: "Email is not authorized for admin access"**
- Email not in whitelist
- Update `ADMIN_WHITELIST` in `/utils/auth.ts`
- Redeploy application

**Q: "Invalid master key"**
- Master key doesn't match stored hash
- Use exact master key from initialization
- Check for extra spaces or typos

**Q: "Password does not meet security requirements"**
Password must have all of:
- ✓ 8+ characters
- ✓ At least 1 uppercase letter
- ✓ At least 1 lowercase letter  
- ✓ At least 1 number
- ✓ At least 1 special character (!@#$%^&*)

Example: `SecureAdmin123!`

### Password Reset

**Q: Reset email not received**
- Development: Check browser console (F12)
- Production: Verify email service is configured
- Check Supabase for password_resets record

**Q: "Reset link has expired"**
- Tokens expire after 1 hour
- Request new reset link

**Q: "Reset link has already been used"**
- Each token is single-use
- Request new reset link

### General Issues

**Q: Database tables not created**
- Run SQL migration in Supabase SQL Editor
- Check for errors in migration output
- Verify user has correct permissions

**Q: RLS policies not working**
- Verify RLS is enabled on tables
- Check policies exist in Supabase
- Ensure user is authenticated

**Q: Can't login as admin**
- Verify email is in whitelist
- Verify admin account exists in `admins` table
- Check password is correct

---

## Security Best Practices

1. ✅ **Never share master key via email or chat**
   - Store in password manager
   - Share in person or via secure channel

2. ✅ **Rotate master key regularly**
   - Monthly or quarterly recommended
   - Use Admin Settings to change
   - Old key is automatically deactivated

3. ✅ **Monitor admin login attempts**
   - Check audit logs regularly
   - Set up alerts for failed logins
   - Review new admin registrations

4. ✅ **Use strong passwords**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, special chars
   - Don't reuse passwords

5. ✅ **Enable HTTPS**
   - All connections must use HTTPS
   - Never transmit credentials over HTTP

6. ✅ **Regular backups**
   - Database backups daily
   - Test recovery procedures
   - Encrypt backups

7. ✅ **Access control**
   - Principle of least privilege
   - Only needed admins in whitelist
   - Remove access when not needed

---

## Next Steps

1. **Deploy to Vercel**: Push code to GitHub → Auto-deploys
2. **Set up email**: Configure SendGrid or AWS SES
3. **Monitor**: Set up Sentry or similar for error tracking
4. **Audit**: Review admin actions regularly
5. **Update**: Keep dependencies updated for security patches

---

## Support & Documentation

- **Full Auth System Docs**: See `AUTH_SYSTEM.md`
- **Supabase Docs**: https://supabase.com/docs
- **Security Best Practices**: https://owasp.org/
- **Password Reset Examples**: Check `services/authService.ts`

---

**Last Updated**: February 2024
**Version**: 1.0
**Status**: Ready for Production
