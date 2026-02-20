# Authentication System Implementation - Step-by-Step

Follow these exact steps to implement the new database-driven authentication system.

---

## Phase 1: Database Setup (Required First)

### Step 1.1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

### Step 1.2: Copy Setup Script
1. Open file: `scripts/auth-setup.sql` in your project
2. Select all content (Ctrl+A)
3. Copy (Ctrl+C)

### Step 1.3: Execute Setup Script
1. Paste into Supabase SQL Editor
2. Click **Run** button
3. Wait for success message ✅

**What this does:**
- Creates `users` table (for all authenticated users)
- Creates `admin_whitelist` table (controls who can be admin)
- Creates `admins` table (stores authorized admins)
- Enables Row Level Security (RLS)
- Creates automatic trigger for user signup
- Seeds default admin whitelist

### Step 1.4: Verify Setup
Run this query to confirm tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- ✅ admin_whitelist
- ✅ admins
- ✅ users

---

## Phase 2: Code Review (No Changes Needed - Already Done!)

### ✅ Already Updated:
- **components/AuthModal.tsx** - Database validation added
- **App.tsx** - Admin check from database added

### What Changed:
1. Removed hardcoded admin emails
2. Added database whitelist check
3. Updated admin authentication flow
4. Added automatic user record creation

---

## Phase 3: Testing (Verify Everything Works)

### Test 3.1: Customer Email/Password Signup

**Steps:**
1. Open app in browser
2. Click **Sign In** button
3. Verify you're on **Customer** tab
4. Fill in form:
   - Email: `testcustomer@example.com`
   - Password: `TestPass123!`
   - Name: `Test Customer`
5. Click **Register**

**Expected Result:**
- ✅ See message: "Account created! Verification email sent..."
- ✅ Modal closes
- ✅ Check your email for verification link
- ✅ Click link to verify
- ✅ Can login with email/password
- ✅ Sees customer store interface

**Database Check:**
```sql
SELECT * FROM public.users WHERE email = 'testcustomer@example.com';
```
Should show: `role='customer', provider='email'`

---

### Test 3.2: Admin Signup - Invalid Email (Should Fail)

**Steps:**
1. Click **Sign In** button
2. Click **Admin Terminal** tab
3. Fill in form:
   - Email: `notanadmin@example.com`
   - Password: `TestPass123!`
4. Click **Register**

**Expected Result:**
- ❌ See error: "Invalid Admin Registration Email. Authorization denied."
- ❌ No account created
- ❌ Modal stays open

**Why?** Email not in `admin_whitelist` table.

---

### Test 3.3: Admin Signup - Valid Email (Should Work)

**Steps:**
1. Click **Sign In** button
2. Click **Admin Terminal** tab
3. Fill in form:
   - Email: `admin@electra.com` (from default whitelist)
   - Password: `TestPass123!`
4. Click **Register**

**Expected Result:**
- ✅ See message: "Admin account created! Verification email sent..."
- ✅ Modal closes
- ✅ Check email for verification link
- ✅ Verify account
- ✅ Login with credentials
- ✅ Auto-redirect to `/admin`
- ✅ See admin dashboard

**Database Check:**
```sql
SELECT * FROM public.admins WHERE email = 'admin@electra.com';
SELECT * FROM public.users WHERE email = 'admin@electra.com';
```
Should show admin in both tables.

---

### Test 3.4: Google OAuth Customer Login

**Steps:**
1. Click **Sign In** button
2. Verify on **Customer** tab
3. Click **Continue with Google** button
4. Complete Google authentication flow
5. Authorize app to access email

**Expected Result:**
- ✅ Google auth completes
- ✅ Auto-redirect to customer store
- ✅ Logged in as customer
- ✅ Can see products

**Database Check:**
```sql
SELECT * FROM public.users WHERE provider = 'google';
```
Should show user with `provider='google', role='customer'`

---

### Test 3.5: Admin Login

**Steps:**
1. Click **Sign In** button
2. Click **Admin Terminal** tab
3. Enter credentials:
   - Email: `admin@electra.com`
   - Password: `TestPass123!`
4. Click **Authenticate**

**Expected Result:**
- ✅ Login successful
- ✅ Auto-redirect to `/admin`
- ✅ See admin dashboard
- ✅ Cannot access customer store

---

### Test 3.6: Customer Login

**Steps:**
1. Click **Sign In** button
2. Customer tab selected (default)
3. Enter credentials:
   - Email: `testcustomer@example.com`
   - Password: `TestPass123!`
4. Click **Authenticate**

**Expected Result:**
- ✅ Login successful
- ✅ Redirect to customer store
- ✅ Can browse products
- ✅ Cannot access `/admin`

---

## Phase 4: Configuration (Customize for Your Use)

### Step 4.1: Update Admin Whitelist

Replace default emails with your actual admin emails.

**Remove defaults:**
```sql
DELETE FROM public.admin_whitelist 
WHERE email IN ('admin@electra.com', 'admin@example.com', 'test.admin@electra.com');
```

**Add your admins:**
```sql
INSERT INTO public.admin_whitelist (email) VALUES 
('yourname@company.com'),
('otheradmin@company.com'),
('manager@company.com');
```

**Verify:**
```sql
SELECT email FROM public.admin_whitelist;
```

---

### Step 4.2: Enable Google OAuth (Optional)

If you want Gmail/Google login:

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google**
3. Click to enable
4. Add Google Cloud OAuth credentials:
   - Client ID
   - Client Secret
5. Set authorized redirect URI
6. Save

Then test with Test 3.4 above.

---

### Step 4.3: Enable Email Verification (Recommended)

For security, require email verification:

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Email**
3. Enable **Confirm email**
4. Set email template (keep default or customize)
5. Save

Users will need to verify email before login.

---

## Phase 5: Deployment (Go Live)

### Step 5.1: Final Testing

Before deploying, run through ALL tests above in staging environment.

Checklist:
- [ ] Customer signup works
- [ ] Admin signup with whitelist works
- [ ] Admin signup without whitelist fails
- [ ] Login for both works
- [ ] Auto-redirect to /admin works
- [ ] Google OAuth works
- [ ] Database records created correctly

### Step 5.2: Deploy to Production

1. Commit all changes to git
2. Push to production branch
3. Deploy via Vercel (or your hosting)
4. Verify in production environment
5. Monitor for errors

### Step 5.3: Post-Deployment

1. **Update admin whitelist** with real admin emails
2. **Test admin signup** with each admin
3. **Keep ADMIN_MANAGEMENT.md** for operations team
4. **Monitor database** for errors
5. **Document any custom changes** you made

---

## Common Issues & Fixes

### Issue: SQL Error on Setup
```
Error: "relation 'public.users' already exists"
```
**Fix**: Tables already exist. Either:
1. Drop and recreate: Use "Drop all" in Supabase
2. Or skip CREATE IF NOT EXISTS queries that fail

---

### Issue: Admin Can't Register
```
Error: "Invalid Admin Registration Email. Authorization denied."
```
**Fix**: Email not in whitelist. Add it:
```sql
INSERT INTO public.admin_whitelist (email) VALUES ('youremail@company.com');
```

---

### Issue: Admin Can't Login
```
Error: "Access Denied: This account is not registered as an administrator."
```
**Fix**: Admin record not created. Check:
```sql
SELECT * FROM public.admins WHERE email = 'youremail@company.com';
```
If empty, manually create signup or insert directly.

---

### Issue: Google Login Returns Error
**Fix**: 
1. Check Google OAuth configured in Supabase
2. Verify redirect URI matches your domain
3. Check browser console for specific error
4. Try incognito window

---

### Issue: Users Not Creating in Database
**Fix**:
1. Check trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgrelname = 'auth';
```
2. Check RLS policies not blocking inserts
3. Check auth.users records exist

---

## Success Criteria

When everything is working, you should see:

✅ Customers can signup with email/password  
✅ Customers can login with email/password  
✅ Customers can login with Google  
✅ Admins can signup with whitelisted email  
✅ Admins cannot signup with non-whitelisted email  
✅ Admins auto-redirect to /admin  
✅ Customers cannot access /admin  
✅ Users table has all users  
✅ Admins table has only admins  
✅ Whitelist controls admin access  

---

## Next: Operations

Once deployed, see **ADMIN_MANAGEMENT.md** for:
- Adding new admin emails
- Removing admin access
- Monitoring users
- Auditing admin actions

---

## Support Documents

- **QUICK_START.md** - Quick reference
- **DATABASE_SETUP.md** - Detailed technical guide
- **ADMIN_MANAGEMENT.md** - Operations guide
- **AUTH_IMPLEMENTATION_SUMMARY.md** - Implementation details
- **CHANGES.md** - All modifications made

---

## Troubleshooting Command Reference

```sql
-- View all users
SELECT * FROM public.users;

-- View all admins  
SELECT * FROM public.admins;

-- View whitelist
SELECT * FROM public.admin_whitelist;

-- Check if email whitelisted
SELECT * FROM public.admin_whitelist WHERE email = 'check@example.com';

-- Check if admin registered
SELECT * FROM public.admins WHERE email = 'admin@example.com';

-- Count users by role
SELECT role, COUNT(*) FROM public.users GROUP BY role;

-- Find user by email
SELECT * FROM public.users WHERE email ILIKE '%search%';

-- Recent signups
SELECT * FROM public.users ORDER BY created_at DESC LIMIT 10;
```

---

**Status**: Ready to Implement  
**Estimated Time**: 20 minutes  
**Difficulty**: Low  

Good luck! 🚀
