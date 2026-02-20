# Complete Authentication Setup Guide

## Which SQL File to Use?

**USE THIS ONE:** `scripts/SIMPLE_AUTH_SETUP.sql`

This is the working version with all fixes applied. It includes everything in one file.

---

## Step-by-Step Setup (5 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** on the left sidebar
4. Click **New Query**

### Step 2: Copy the SQL
1. Open this file: `scripts/SIMPLE_AUTH_SETUP.sql`
2. Copy ALL the SQL code

### Step 3: Paste and Run
1. Paste the SQL into the Supabase SQL Editor
2. Click the blue **Run** button (or press Ctrl+Enter)
3. Wait for completion

### Step 4: Verify
You should see output like:
```
table_name      | count
users           | 0
admin_whitelist | 3
admins          | 0
```

---

## What Gets Created

### Users Table
Stores all authenticated users (customers + admins)
```
id (UUID) | email | provider | role | created_at
```

### Admin Whitelist Table
Controls who can register as admin
```
id | email | approved | created_at
```

Pre-populated with:
- admin@electra.com
- admin@example.com
- test.admin@electra.com

### Admins Table
Stores authorized admin users
```
id (UUID) | email | role | created_at
```

---

## How It Works

1. **User Signs Up** → Trigger fires → User record created automatically
2. **Admin Email Check** → If email in `admin_whitelist` → Admin record created
3. **User Logs In** → Frontend queries `admins` table → Determines role
4. **Admin Dashboard** → Only admins can access

---

## Testing the System

### Test 1: Customer Signup
- Email: `customer@example.com`
- Password: `TestPass123!`
- Expected: ✅ Account created, role = customer

### Test 2: Admin Signup (Valid)
- Email: `admin@electra.com`
- Password: `TestPass123!`
- Expected: ✅ Account created, role = admin, auto-redirect to `/admin`

### Test 3: Admin Signup (Invalid)
- Email: `nope@example.com`
- Password: `TestPass123!`
- Expected: ❌ Error: "Invalid Admin Registration Email. Authorization denied."

### Test 4: Google OAuth
- Click "Continue with Google"
- Sign in with Gmail
- Expected: ✅ User record auto-created with provider = google

---

## Adding More Admin Emails

In Supabase SQL Editor, run:
```sql
INSERT INTO admin_whitelist (email, approved) VALUES 
  ('newadmin@company.com', true);
```

Or use Supabase Dashboard Table Editor to add rows directly.

---

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the entire SQL script
- Check that all tables were created

### Error: "syntax error"
- Copy from `SIMPLE_AUTH_SETUP.sql` again (ensure no partial copy)
- Paste everything and run

### Users not being created automatically
- Check the trigger exists: `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`
- Verify the trigger is active in your database

### Admin not auto-redirecting
- Check that email is in `admin_whitelist` table
- Verify `admins` record was created
- Check browser console for errors

---

## Database Queries

Check what's in your database:

```sql
-- See all users
SELECT * FROM users;

-- See all admins
SELECT * FROM admins;

-- See admin whitelist
SELECT * FROM admin_whitelist;

-- Check if specific user is admin
SELECT * FROM admins WHERE email = 'admin@electra.com';
```

---

## You're Done!
The authentication system is now fully integrated with Supabase. Your frontend code will automatically:
- Create user records on signup
- Check admin status on login
- Redirect admins to dashboard
- Validate admin emails against the whitelist database
