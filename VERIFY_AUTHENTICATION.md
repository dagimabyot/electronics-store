# Authentication System - Verification & Testing

## SQL Setup Verification

### Step 1: Run the Complete SQL Setup
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create a **New Query**
3. Copy entire contents of `scripts/AUTH_SETUP_COMPLETE.sql`
4. Click **Run** button
5. You should see: **Query executed successfully** (no errors)

### Step 2: Verify Tables Were Created
In Supabase SQL Editor, run:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('users', 'admin_whitelist', 'admins');
```

**Expected Result**: Three rows returned (users, admin_whitelist, admins)

### Step 3: Verify Admin Whitelist
```sql
SELECT email, approved FROM admin_whitelist ORDER BY created_at DESC;
```

**Expected Result**:
- admin@electra.com (true)
- admin@example.com (true)
- test.admin@electra.com (true)

---

## Authentication Flow Testing

### Test 1: Customer Email/Password Signup
1. Open your app → Click **Sign In** → **Customer tab**
2. Click **"Need a new identity? Register"**
3. Enter:
   - Name: John Doe
   - Email: customer@test.com
   - Password: TestPassword123!
4. Click **Complete Setup**
5. **Expected**: Success message → Email verification alert

**Verification in Database**:
```sql
SELECT * FROM users WHERE email = 'customer@test.com';
```
**Expected**: One row with role='customer', provider='email'

---

### Test 2: Admin Signup (Invalid Email)
1. Click **Sign In** → **Admin Terminal tab**
2. Click **"Need a new identity? Register"**
3. Enter:
   - Name: John Admin
   - Email: invalid@email.com (NOT in whitelist)
   - Password: TestPassword123!
4. Click **Complete Setup**
5. **Expected Error**: "Invalid Admin Registration Email. Authorization denied."

---

### Test 3: Admin Signup (Valid Email)
1. Click **Sign In** → **Admin Terminal tab**
2. Click **"Need a new identity? Register"**
3. Enter:
   - Name: Admin User
   - Email: admin@electra.com (in whitelist)
   - Password: TestPassword123!
4. Click **Complete Setup**
5. **Expected**: Success message → Email verification alert

**Verification in Database**:
```sql
SELECT * FROM admins WHERE email = 'admin@electra.com';
```
**Expected**: One row with role='admin'

---

### Test 4: Customer Login
1. Verify email first (click verification link from email or use SQL)
2. Click **Sign In** → **Customer tab**
3. Enter email and password from Test 1
4. Click **Authenticate**
5. **Expected**: Redirected to store home page with cart icon visible

---

### Test 5: Admin Login
1. Verify email first
2. Click **Sign In** → **Admin Terminal tab**
3. Enter email: admin@electra.com and password from Test 3
4. Click **Authenticate**
5. **Expected**: Auto-redirected to `/admin` dashboard (no store visible)

---

### Test 6: Google OAuth
1. Click **Sign In** → **Customer tab** (or Admin tab if you have admin email in Google)
2. Click **Continue with Google**
3. Complete Google authentication
4. **Expected**: User record created in database, redirected appropriately

**Verification**:
```sql
SELECT * FROM users WHERE provider = 'google' ORDER BY created_at DESC LIMIT 1;
```

---

## Common Issues & Fixes

### Issue: "syntax error at or near LOWER"
**Fix**: Tables have been updated to use `email_lower` column. Run latest `AUTH_SETUP_COMPLETE.sql`

### Issue: Admin can still see store
**Fix**: Check that user ID exists in `admins` table. Run:
```sql
SELECT * FROM admins WHERE id = 'USER_ID_HERE';
```

### Issue: Email verification not arriving
1. Check Supabase → **Authentication** → **Email Templates**
2. Verify email is configured correctly
3. Check spam folder

### Issue: Can't add more admins later
**To Add New Admin**:
1. Insert into whitelist:
```sql
INSERT INTO admin_whitelist (email, approved) VALUES ('newaadmin@email.com', true);
```
2. User can now register with that email

---

## Production Checklist

- [ ] All three SQL scripts executed successfully
- [ ] Tables created and verified
- [ ] Admin whitelist seeded with real emails
- [ ] Test customer signup and login
- [ ] Test admin signup and login (with valid email)
- [ ] Test admin signup rejection (with invalid email)
- [ ] Test Google OAuth
- [ ] Verify admin auto-redirect to `/admin` works
- [ ] Verify customer sees store home page
- [ ] Verify RLS policies are enabled on all tables
- [ ] Test user cannot access `/admin` route

---

## SQL Queries for Database Management

### View All Authenticated Users
```sql
SELECT id, email, provider, role, created_at FROM users ORDER BY created_at DESC;
```

### View All Admins
```sql
SELECT id, email, role, created_at, last_login FROM admins ORDER BY created_at DESC;
```

### Add New Admin to Whitelist
```sql
INSERT INTO admin_whitelist (email, approved) VALUES ('newemail@company.com', true)
ON CONFLICT (email_lower) DO NOTHING;
```

### Remove Admin from Whitelist
```sql
DELETE FROM admin_whitelist WHERE email_lower = 'admin@electra.com';
```

### Promote Customer to Admin
```sql
-- First add to whitelist
INSERT INTO admin_whitelist (email, approved) VALUES ('customer@email.com', true)
ON CONFLICT (email_lower) DO NOTHING;

-- Then add to admins table
INSERT INTO admins (id, email) 
SELECT id, email FROM users WHERE email = 'customer@email.com'
ON CONFLICT (email_lower) DO NOTHING;
```

### Remove Admin Access
```sql
DELETE FROM admins WHERE email_lower = 'admin@electra.com';
```

### Check Specific User Details
```sql
SELECT u.*, a.role as admin_role FROM users u
LEFT JOIN admins a ON u.id = a.id
WHERE u.email = 'test@email.com';
```

---

## Frontend Code Verification

The following files have been updated to use database-driven authentication:

1. **components/AuthModal.tsx**
   - Queries `admin_whitelist` table for signup validation
   - Shows "Invalid Admin Registration Email. Authorization denied." on error
   - Uses `email_lower` column for case-insensitive lookup

2. **App.tsx**
   - Queries `admins` table to determine user role
   - Auto-creates `users` records for OAuth users
   - Auto-redirects admins to `/admin` dashboard
   - Sets role='admin' or 'customer' based on database

All hardcoded admin emails have been removed from the codebase.

---

## Success Indicators

✅ All three tables created without errors
✅ Admin whitelist populated with 3 emails
✅ Customers can register and login
✅ Invalid admin emails rejected with specific message
✅ Valid admin emails accepted
✅ Admins auto-redirected to dashboard
✅ Customers see store home page
✅ Google OAuth creates user records
✅ User records visible in database
✅ Admin records visible in admins table
