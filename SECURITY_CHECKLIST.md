# Security Checklist - Authentication System

## Pre-Deployment Verification

### 1. Database Security ✓

- [ ] **RLS Enabled**
  ```bash
  # Verify in Supabase SQL Editor
  SELECT table_name, row_level_security FROM information_schema.tables 
  WHERE table_name IN ('admins', 'password_resets', 'master_key_storage', 'master_key_history');
  ```
  Expected: All tables show `true`

- [ ] **RLS Policies Created**
  - Check Supabase Table Editor → Select each table → Click "RLS"
  - Verify policies exist for SELECT, INSERT, UPDATE as needed

- [ ] **Database Backups Configured**
  - Enable automated backups in Supabase
  - Set backup frequency to daily or more
  - Test backup restoration

- [ ] **Database Access Restricted**
  - Service role key never used in client code
  - Anon key scoped appropriately
  - API key rotation scheduled

### 2. Authentication Security ✓

- [ ] **Password Hashing**
  - Using bcrypt with 12 rounds
  - Review: `utils/auth.ts` line ~34

- [ ] **Master Key Hashing**
  - Using bcrypt, never stored plaintext
  - Review: `utils/auth.ts` line ~44

- [ ] **Session Management**
  - Supabase auth sessions configured
  - HTTP-only cookies enabled
  - Session timeout appropriate

- [ ] **Password Reset Tokens**
  - Using crypto.randomBytes(32) for tokens
  - Tokens expire after 1 hour
  - One-time use enforced

- [ ] **No Sensitive Data in Logs**
  - Passwords never logged
  - Master key never logged
  - Reset tokens never logged

### 3. Admin Access Control ✓

- [ ] **Email Whitelist Configured**
  - Check: `utils/auth.ts` line ~8 `ADMIN_WHITELIST`
  - Only authorized emails listed
  - Production emails verified

- [ ] **Master Key Initialized**
  - Run: `node scripts/init-master-key.js`
  - Verify: Entry in `master_key_storage` table
  - Key stored securely (not in git)

- [ ] **Admin Registration Disabled**
  - No public signup URL
  - Only via master key validation
  - Email whitelist enforced

- [ ] **Re-authentication Required**
  - Master key changes require password entry
  - Sensitive operations require authentication
  - Review: `components/AdminSettings.tsx`

### 4. Data Protection ✓

- [ ] **Encryption in Transit**
  - HTTPS enforced for all connections
  - No HTTP fallback
  - SSL/TLS certificates valid

- [ ] **Encryption at Rest**
  - Master key hashed (not reversible)
  - Password reset tokens hashed
  - User passwords hashed with bcrypt

- [ ] **No Sensitive Data Exposure**
  - Master key not in environment files
  - API keys not in source code
  - Reset tokens not logged

- [ ] **Database Permissions**
  - Service role key permissions minimal
  - Anon key restricted to necessary tables
  - Admin operations require service role

### 5. Input Validation ✓

- [ ] **Email Validation**
  - Using regex pattern in `utils/auth.ts`
  - Admin emails checked against whitelist
  - SQL injection prevented

- [ ] **Password Validation**
  - Strength requirements enforced
  - Length minimum 8 characters
  - Special characters required
  - Review: `validatePasswordStrength()` in `utils/auth.ts`

- [ ] **Master Key Validation**
  - Length requirements set
  - Format validation
  - Comparison using bcrypt.compare()

- [ ] **Token Validation**
  - Format validation
  - Expiry checking
  - One-time use verification

### 6. Error Handling ✓

- [ ] **Generic Error Messages**
  - No "user not found" messages
  - No "master key is incorrect" (too specific)
  - Example: "Invalid credentials"

- [ ] **Logging Security**
  - No passwords in logs
  - No tokens in logs
  - Only necessary info logged

- [ ] **Error Recovery**
  - Users can request new reset link
  - No lockout after failed attempts
  - Clear error messages for valid issues

### 7. Access Control ✓

- [ ] **Admin Dashboard Access**
  - Only authenticated admins can access
  - Session checked on page load
  - Redirect to login if not authenticated
  - Review: `components/AdminPortal.tsx` line ~30

- [ ] **Settings Panel Access**
  - Only authenticated admins
  - Re-authentication for changes
  - Review: `components/AdminSettings.tsx`

- [ ] **API Endpoint Protection**
  - All protected endpoints check auth
  - User ID verified from session
  - No privilege escalation possible

### 8. Audit & Monitoring ✓

- [ ] **Master Key Changes Logged**
  - Entry in `master_key_history` table
  - Includes admin email and timestamp
  - Notes field for tracking
  - Review: `services/authService.ts` line ~290

- [ ] **Failed Login Attempts**
  - Monitor: Check Supabase auth logs
  - Set up alerts for repeated failures
  - Review access patterns

- [ ] **Admin Activity Logged**
  - Track master key changes
  - Log product modifications
  - Monitor order changes

- [ ] **Regular Audit Review**
  - Weekly: Check master key history
  - Monthly: Review admin access patterns
  - Quarterly: Full security audit

### 9. Environment & Configuration ✓

- [ ] **Environment Variables**
  - NEXT_PUBLIC_SUPABASE_URL set
  - NEXT_PUBLIC_SUPABASE_ANON_KEY set
  - SUPABASE_SERVICE_ROLE_KEY set (server-only)
  - No secrets in .env.local committed to git

- [ ] **.env.local in .gitignore**
  - Check: `.gitignore` file
  - Verify: Environment files not committed
  - Review: Git history for leaks

- [ ] **Production Secrets**
  - Use Vercel Secrets Manager
  - Rotate secrets regularly
  - Never share in email/chat

- [ ] **CORS Configuration**
  - Supabase CORS configured
  - Only allowed domains listed
  - Production domain added

### 10. Communication Security ✓

- [ ] **Password Reset Emails**
  - Links include token and email parameters
  - Links expire after 1 hour
  - One-time use enforcement
  - Secure email service configured

- [ ] **Email Service**
  - Using verified email sender
  - SendGrid, AWS SES, or similar
  - Encryption in transit
  - Bounce and complaint handling

- [ ] **No Sensitive Data in Email**
  - Passwords never emailed
  - Master key never emailed
  - Reset links only include token

---

## Pre-Production Deployment

### Verification Steps

**Step 1: Database Migration**
```bash
# Verify tables exist
node scripts/migrate-auth.js
# Check output for success
```

**Step 2: Master Key Initialization**
```bash
# Initialize master key
ADMIN_MASTER_KEY="your-secure-key" node scripts/init-master-key.js
# Save output - you'll need this value
```

**Step 3: Test Customer Flow**
- [ ] Register as customer
- [ ] Try password reset
- [ ] Verify reset link works
- [ ] Login with new password

**Step 4: Test Admin Flow**
- [ ] Try admin login with unauthorized email → Denied
- [ ] Register admin with correct credentials → Success
- [ ] Login as admin → Dashboard shown
- [ ] Change master key → Success

**Step 5: Security Verification**
- [ ] RLS policies enabled
- [ ] Passwords properly hashed
- [ ] Master key hashed and secure
- [ ] No sensitive data logged

---

## Post-Deployment Monitoring

### Weekly Tasks
- [ ] Review admin login attempts
- [ ] Check failed password reset attempts
- [ ] Monitor error logs for attacks
- [ ] Verify RLS policies still active

### Monthly Tasks
- [ ] Audit master key history
- [ ] Review admin access patterns
- [ ] Check for unauthorized access attempts
- [ ] Update admin whitelist if needed

### Quarterly Tasks
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Review and update security policies
- [ ] Backup integrity verification

---

## Incident Response

### Compromised Master Key

1. **Immediate Actions**
   ```bash
   # Login as admin
   # Go to Settings → Master Key Management
   # Change master key to new value
   # Verify change logged in master_key_history
   ```

2. **Notify Admins**
   - Send notification to all admins
   - Request password updates
   - Explain what happened

3. **Review Logs**
   - Check `master_key_history` table
   - Verify old key is deactivated
   - Review any admin registrations since compromise

### Unauthorized Admin Access

1. **Immediate Actions**
   ```sql
   -- In Supabase SQL Editor
   -- Revoke admin access
   UPDATE profiles SET role = 'customer' WHERE id = 'admin_uuid';
   DELETE FROM admins WHERE email = 'unauthorized@email.com';
   ```

2. **Notify Security Team**
   - Alert team of breach
   - Change master key
   - Review all admin actions

3. **Review Audit Logs**
   - Check `master_key_history`
   - Monitor what access they had
   - Review orders/products modified

### Mass Failed Login Attempts

1. **Identify Pattern**
   - Check Supabase auth logs
   - Look for repeated failed attempts
   - Identify IP addresses

2. **Implement Rate Limiting**
   - Add login attempt throttling
   - Block suspicious IPs
   - Set up alerts

3. **Notify Admins**
   - Alert of attack attempt
   - Request password review
   - Consider password reset

---

## Compliance & Regulations

### GDPR Compliance
- [ ] User data can be exported
- [ ] User data can be deleted
- [ ] Privacy policy updated
- [ ] Consent forms in place

### PCI DSS (if handling payments)
- [ ] No passwords stored in plaintext
- [ ] No credit cards in database
- [ ] Stripe handles payment info
- [ ] Regular security audits

### HIPAA (if handling health data)
- [ ] Encryption in transit and at rest
- [ ] Access controls enforced
- [ ] Audit logging enabled
- [ ] Data retention policies

---

## Security Testing

### Manual Testing Checklist

**Authentication Testing**
- [ ] Register with valid email
- [ ] Register with invalid email format
- [ ] Register with duplicate email
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Admin login with unauthorized email
- [ ] Admin registration with wrong master key

**Password Reset Testing**
- [ ] Request reset for valid email
- [ ] Request reset for invalid email
- [ ] Click reset link in time
- [ ] Click reset link after 1 hour
- [ ] Use same reset link twice
- [ ] Reset to weak password (should fail)

**Admin Settings Testing**
- [ ] Access settings as authenticated admin
- [ ] Try settings without authentication (should fail)
- [ ] Change master key with wrong current key
- [ ] Change master key with correct key
- [ ] Verify change logged in database

### Automated Testing

```javascript
// Example test file
describe('Authentication Security', () => {
  test('Should hash passwords with bcrypt', async () => {
    const { hashMasterKey } = require('@/utils/auth');
    const hash = await hashMasterKey('test-key');
    expect(hash).not.toBe('test-key');
    expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt pattern
  });

  test('Should reject unauthorized admin emails', () => {
    const { isAdminEmailAllowed } = require('@/utils/auth');
    expect(isAdminEmailAllowed('admin@example.com')).toBe(true);
    expect(isAdminEmailAllowed('hacker@example.com')).toBe(false);
  });

  test('Should validate password strength', () => {
    const { validatePasswordStrength } = require('@/utils/auth');
    const weak = validatePasswordStrength('pass');
    expect(weak.isValid).toBe(false);
    const strong = validatePasswordStrength('SecurePass123!');
    expect(strong.isValid).toBe(true);
  });
});
```

---

## Third-Party Security

### Supabase Security
- [ ] Enable 2FA on Supabase account
- [ ] Limit team member access
- [ ] Review API key permissions
- [ ] Enable audit logs

### Vercel Security
- [ ] Enable 2FA on Vercel account
- [ ] Use environment variables for secrets
- [ ] Review deployment logs
- [ ] Set up security alerts

### Email Service Security
- [ ] Use verified sender domain
- [ ] Enable SPF/DKIM/DMARC
- [ ] Use API keys (not passwords)
- [ ] Monitor bounce rates

---

## Documentation & Training

- [ ] Document master key rotation process
- [ ] Create admin onboarding guide
- [ ] Document incident response procedures
- [ ] Train team on security best practices
- [ ] Review security quarterly

---

## Final Verification

Before going live:

```bash
# 1. Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 2. Test database connection
node scripts/migrate-auth.js

# 3. Verify master key
node scripts/init-master-key.js

# 4. Run tests
npm test

# 5. Check for security issues
npm audit

# 6. Deploy to staging
git push origin staging

# 7. Test in staging environment
# 8. Deploy to production
git push origin main
```

---

## Sign-Off

- **Reviewed By**: _______________
- **Date**: _______________
- **Approved for Production**: _______________

---

**Last Updated**: February 2024
**Next Review**: Quarterly
**Severity**: Critical
