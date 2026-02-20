# Database Authentication Setup Guide

## Overview
This document explains how to set up the database-driven authentication system for the Electra Electronics store. The system uses Supabase PostgreSQL with Row Level Security (RLS) to manage user authentication and admin access control.

## Database Tables

### 1. `users` table
Stores all authenticated users (both customers and admins).

**Fields:**
- `id` (UUID) - Primary key, references auth.users(id)
- `email` (VARCHAR) - User's email address (unique)
- `provider` (VARCHAR) - Authentication provider ('email' or 'google')
- `role` (VARCHAR) - User role ('customer' or 'admin')
- `created_at` (TIMESTAMP) - Account creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### 2. `admin_whitelist` table
Controls which emails can register as admins. This is the source of truth for admin access control.

**Fields:**
- `id` (BIGSERIAL) - Primary key
- `email` (VARCHAR) - Admin email address (unique)
- `created_at` (TIMESTAMP) - When added to whitelist

**Default Whitelist Emails:**
- admin@electra.com
- admin@example.com
- test.admin@electra.com

### 3. `admins` table
Stores authorized admin user records after successful signup/login.

**Fields:**
- `id` (UUID) - Primary key, references auth.users(id)
- `email` (VARCHAR) - Admin email (unique)
- `role` (VARCHAR) - Always 'admin'
- `created_at` (TIMESTAMP) - Admin account creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

## Setup Instructions

### Step 1: Create the Database Tables

Go to your Supabase dashboard:
1. Navigate to the **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `scripts/auth-setup.sql`
4. Click **Run**

This will create:
- `users` table with RLS policies
- `admin_whitelist` table with default admin emails
- `admins` table with RLS policies
- Automatic trigger to create user records on signup
- Database indexes for performance

### Step 2: Enable Email Verification (Optional but Recommended)

In Supabase Dashboard:
1. Go to **Authentication** → **Providers** → **Email**
2. Enable **Confirm email**
3. Set email template as desired

### Step 3: Configure Google OAuth (For Gmail Login)

In Supabase Dashboard:
1. Go to **Authentication** → **Providers** → **Google**
2. Enable the provider
3. Add your Google Cloud OAuth credentials
4. Set authorized redirect URI to: `https://your-domain.com`

### Step 4: Test the Authentication System

#### Customer Signup (Email/Password):
1. Click "Sign In" → Customer tab → Register
2. Enter email, password, and name
3. Verify email from inbox
4. Login with credentials
5. Should see customer store interface

#### Customer Signup (Google):
1. Click "Sign In" → Customer tab → Continue with Google
2. Complete Google authentication
3. Auto-redirected to store
4. User record created in `users` table with provider='google'

#### Admin Signup (Email/Password):
1. Click "Sign In" → Admin Terminal tab → Register
2. Enter email from whitelist (e.g., admin@electra.com)
3. Enter password
4. System checks admin_whitelist, then creates records in both `users` and `admins` tables
5. Verify email
6. Login to access admin dashboard

#### Admin Login:
1. Click "Sign In" → Admin Terminal tab → Login
2. System verifies record exists in `admins` table
3. Auto-redirected to /admin dashboard
4. If not an admin, gets error: "Access Denied: This account is not registered as an administrator."

## How It Works

### Email/Password Signup Flow:
1. User submits signup form
2. For admin signup: Check if email exists in `admin_whitelist`
3. If not whitelisted: Show error "Invalid Admin Registration Email. Authorization denied."
4. If whitelisted or customer: Create Supabase auth user
5. Automatic trigger (`on_auth_user_created`) creates record in `users` table
6. For admin: Also create record in `admins` table
7. Send verification email

### Google OAuth Flow:
1. User clicks "Continue with Google"
2. Redirected to Google authentication
3. Google returns authenticated session
4. Supabase `onAuthStateChange` triggers
5. Automatic trigger creates record in `users` table with provider='google'
6. System checks if user is in `admins` table for role determination
7. Auto-redirect to /admin if admin, or /home if customer

### Login Flow:
1. User submits login credentials or completes OAuth
2. Supabase authenticates
3. System queries `admins` table to determine role
4. If admin found: role='admin', auto-redirect to /admin
5. If not found: role='customer', show customer interface

## Row Level Security (RLS) Policies

### `users` table:
- **SELECT**: Users can read their own record
- **INSERT**: Users can insert their own record
- **UPDATE**: Users can update their own record

### `admin_whitelist` table:
- **SELECT**: Anyone can read (needed for signup validation)

### `admins` table:
- **SELECT**: Only admins can see all admin records, or users can see their own
- **INSERT**: Admin records can be inserted

## Managing Admin Whitelist

### Add New Admin Email:
```sql
INSERT INTO public.admin_whitelist (email) 
VALUES ('newemail@company.com');
```

### Remove Admin Email:
```sql
DELETE FROM public.admin_whitelist 
WHERE email = 'email@company.com';
```

### View All Whitelisted Emails:
```sql
SELECT * FROM public.admin_whitelist;
```

### View All Admins:
```sql
SELECT * FROM public.admins;
```

## Troubleshooting

### Issue: "Invalid Admin Registration Email. Authorization denied."
- **Cause**: Email not in `admin_whitelist` table
- **Solution**: Add email to `admin_whitelist` or ask system admin to add it

### Issue: Admin login shows "Access Denied"
- **Cause**: Admin signup incomplete or email not in `admins` table
- **Solution**: 
  1. Check email is in `admin_whitelist`
  2. Verify email was confirmed
  3. Check if record was created in `admins` table

### Issue: Google login not working
- **Cause**: OAuth not configured or redirect URI mismatch
- **Solution**:
  1. Verify Google OAuth credentials in Supabase
  2. Check redirect URI matches deployment domain
  3. Check browser console for specific error

### Issue: User not auto-redirected to admin dashboard
- **Cause**: `admins` table query failed or user not in table
- **Solution**:
  1. Verify user exists in `admins` table
  2. Check database connection
  3. Review browser console logs

## Security Notes

1. **Hardcoding Prevention**: Admin emails are stored in database, not hardcoded
2. **RLS Enforcement**: All table access is restricted via RLS policies
3. **Email Verification**: Users must verify email before full access (configurable)
4. **OAuth Security**: Google OAuth handled by Supabase securely
5. **Password Security**: Passwords hashed by Supabase auth system
6. **Admin Whitelist**: Controls who can become admin before signup

## API References

### Check if User is Admin:
```typescript
const { data: adminData } = await supabase
  .from('admins')
  .select('*')
  .eq('id', userId)
  .single();

const isAdmin = !!adminData;
```

### Get User Role:
```typescript
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', userId)
  .single();

const role = userData?.role; // 'admin' or 'customer'
```

### Check Admin Whitelist:
```typescript
const { data: whitelistedEmail } = await supabase
  .from('admin_whitelist')
  .select('email')
  .eq('email', emailToCheck)
  .single();

const isWhitelisted = !!whitelistedEmail;
```

## Next Steps

1. Run the SQL setup script in Supabase
2. Configure Google OAuth (if using Gmail login)
3. Add/manage admin whitelist as needed
4. Test all authentication flows
5. Deploy to production

For questions or issues, refer to:
- Supabase Documentation: https://supabase.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
