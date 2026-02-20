# Database Setup Checklist

Follow these steps to set up authentication in your Supabase project.

## Prerequisites
- Supabase project created
- Database connection ready
- SQL Editor access in Supabase dashboard

## Setup Steps

### 1. ✅ Create Users Table
**File:** `scripts/auth-setup-step1.sql`

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy entire contents of `auth-setup-step1.sql`
4. Click "Run"
5. Verify table created in Table Editor

**What it creates:**
- `users` table with columns: id, email, provider, role, created_at, updated_at
- Row Level Security policies
- Index on email
- Auto-update trigger for timestamps

### 2. ✅ Create Admin Tables
**File:** `scripts/auth-setup-step2.sql`

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy entire contents of `auth-setup-step2.sql`
4. Click "Run"
5. Verify both tables in Table Editor

**What it creates:**
- `admin_whitelist` table: Authorized admin emails
- `admins` table: Verified admin users
- Row Level Security policies
- Initial seed data with 3 example admin emails:
  - `admin@electra.com`
  - `admin@example.com`
  - `test.admin@electra.com`

### 3. ✅ Create Database Functions
**File:** `scripts/auth-setup-step3.sql`

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy entire contents of `auth-setup-step3.sql`
4. Click "Run"
5. Verify functions in Functions section (or run: `select * from pg_proc where proname like '%admin%'`)

**What it creates:**
- `is_admin_email()` function
- `create_user_on_signup()` function (TRIGGER)
- `verify_admin_access()` function
- `update_admin_last_login()` function
- Trigger `on_auth_user_created` on auth.users table

### 4. ✅ Verify Trigger is Active
1. Go to Supabase Dashboard → SQL Editor
2. Run query:
```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```
3. Should return 1 row indicating trigger is enabled

### 5. ✅ Test User Creation
1. Go to Supabase Dashboard → Authentication
2. Create a test user manually (click "Add user")
3. Go to Table Editor → `users` table
4. Verify new row was automatically created with correct email and provider

### 6. ✅ Seed Admin Whitelist
**Optional - Already seeded with examples**

To add more admin emails, run:
```sql
INSERT INTO admin_whitelist (email) VALUES 
  ('your.email@example.com'),
  ('another.admin@example.com')
ON CONFLICT (email) DO NOTHING;
```

### 7. ✅ Test Admin Signup
1. Start the app
2. Click "Sign In" → "Admin" tab
3. Try signing up with a non-whitelisted email
   - Should see error: "Invalid Admin Registration Email. Authorization denied."
4. Try signing up with `admin@electra.com`
   - Should succeed with verification email

### 8. ✅ Verify Admin in Database
After admin signup and email verification:
1. Go to Supabase Dashboard → Table Editor
2. Check `users` table:
   - New row exists with email and provider
3. Check `admins` table:
   - New row exists with same email and role='admin'

### 9. ✅ Test Google OAuth
1. Ensure Google OAuth is configured in Supabase:
   - Go to Authentication → Providers → Google
   - Add your Google Client ID and Secret
2. In app, click "Google Sign-in"
3. After authentication, check `users` table
   - Should have new row with provider='google'
4. Verify user role is correct (admin if email in admins table)

### 10. ✅ Test Admin Dashboard Access
1. Log in as admin user
2. Should auto-redirect to `/admin`
3. Should see admin dashboard (not store)
4. Try accessing `/admin` as customer
   - Should be redirected to home page

## Quick Test Cases

### Test Case 1: Customer Email Signup
- [ ] Enter customer email (not in whitelist)
- [ ] Sign up successfully
- [ ] Email verified
- [ ] Logged in, sees store
- [ ] Cannot access `/admin`

### Test Case 2: Admin Email Signup
- [ ] Select "Admin" tab
- [ ] Enter non-whitelisted email
- [ ] See error: "Invalid Admin Registration Email. Authorization denied."
- [ ] Try with `admin@electra.com`
- [ ] Sign up successfully
- [ ] Email verified
- [ ] Auto-redirected to `/admin`
- [ ] Can see admin dashboard

### Test Case 3: Google OAuth (Customer)
- [ ] Click "Google Sign-in"
- [ ] Sign in with regular Google account
- [ ] Logged in, sees store
- [ ] User record created in database with provider='google'

### Test Case 4: Google OAuth (Admin)
- [ ] Click "Google Sign-in"
- [ ] Sign in with whitelisted admin Google account
- [ ] Auto-redirected to `/admin`
- [ ] User and admin records created
- [ ] Can access admin dashboard

### Test Case 5: Admin Login
- [ ] Log out
- [ ] Click "Admin" tab
- [ ] Try login with customer email
- [ ] See error: "Access Denied: This account is not registered as an administrator."
- [ ] Try login with admin email
- [ ] Successful login, auto-redirected to `/admin`

## Database Tables Reference

### users
```
id: UUID (PK, refs auth.users)
email: TEXT (UNIQUE, LOWER)
provider: TEXT ('email' or 'google')
role: TEXT DEFAULT 'customer' ('customer' or 'admin')
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### admin_whitelist
```
id: UUID (PK)
email: TEXT (UNIQUE, LOWER)
approved: BOOLEAN DEFAULT true
created_at: TIMESTAMP
created_by: UUID (refs auth.users)
```

### admins
```
id: UUID (PK, refs auth.users)
email: TEXT (UNIQUE, LOWER)
role: TEXT DEFAULT 'admin' (only 'admin')
approved_by: UUID (refs auth.users)
created_at: TIMESTAMP
last_login: TIMESTAMP
```

## Rollback/Reset (if needed)

To delete all tables and start over:
```sql
-- WARNING: This deletes all data
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS admin_whitelist CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS is_admin_email(TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_user_on_signup() CASCADE;
DROP FUNCTION IF EXISTS verify_admin_access(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_admin_last_login() CASCADE;
```

Then re-run steps 1-3 above.
