# Authentication System Setup Guide

This document explains how to set up the database-driven authentication system for the Electra Electronics app.

## Overview

The authentication system uses Supabase with the following architecture:

1. **Supabase Auth** - Handles email/password and OAuth (Google) authentication
2. **Users Table** - Stores all authenticated users (email, provider, role, timestamps)
3. **Admin Whitelist Table** - Maintains a list of emails authorized to be admins
4. **Admins Table** - Stores verified admin users (references users table)
5. **Database Triggers** - Automatically create user records when users sign up via Supabase Auth

## Database Setup

### Step 1: Create Users Table
Run the SQL from `scripts/auth-setup-step1.sql` in your Supabase SQL Editor:

```sql
-- This creates the users table with:
-- - id (references auth.users)
-- - email
-- - provider ('email' or 'google')
-- - role ('customer' or 'admin')
-- - created_at, updated_at timestamps
-- - Row Level Security enabled
-- - Automatic timestamp updates on modifications
```

### Step 2: Create Admin Tables
Run the SQL from `scripts/auth-setup-step2.sql`:

```sql
-- Creates admin_whitelist table:
-- - Stores authorized admin emails
-- - approved boolean flag
-- - created_at timestamp

-- Creates admins table:
-- - References users.id
-- - Stores verified admin users
-- - Tracks approvals and last login
```

### Step 3: Create Database Functions
Run the SQL from `scripts/auth-setup-step3.sql`:

```sql
-- Creates functions:
-- - is_admin_email() - Check if email is in whitelist
-- - create_user_on_signup() - Trigger that creates user records
-- - verify_admin_access() - Check if user is admin
-- - update_admin_last_login() - Track last login

-- Creates trigger:
-- - on_auth_user_created - Fires when user signs up
```

### Step 4: Seed Initial Admin Whitelist

Add your admin emails to the admin_whitelist table:

```sql
INSERT INTO admin_whitelist (email) VALUES 
  ('your.email@example.com'),
  ('another.admin@example.com')
ON CONFLICT (email) DO NOTHING;
```

## Frontend Authentication Flow

### Email/Password Signup (Customer)
1. User enters email, password, name
2. Frontend calls `supabase.auth.signUp()`
3. Database trigger automatically creates user record with role='customer'
4. User receives verification email
5. After email verification, user is logged in

### Email/Password Signup (Admin)
1. User selects "Admin" tab and enters email, password, name
2. **Frontend checks admin_whitelist table** - if email not found, signup is blocked with error: "Invalid Admin Registration Email. Authorization denied."
3. If email is whitelisted, Supabase signup is called
4. Database trigger automatically creates user record AND admin record
5. User receives verification email
6. After verification, user is logged in and auto-redirected to `/admin`

### Google OAuth Signup/Login
1. User clicks "Google Sign-in"
2. User authenticates with Google
3. Supabase creates auth.users record
4. `onAuthStateChange` listener in App.tsx detects login
5. `handleUserSession()` checks if user record exists in users table
6. If not, creates user record with provider='google'
7. Checks if user is in admins table to determine role
8. If admin, auto-redirects to `/admin`

### Login Flow (Email/Password)
1. User enters email and password
2. Frontend verifies with Supabase
3. If "Admin" tab selected, verifies user exists in admins table
4. If not admin but admin tab selected, denies login
5. Sets user role based on admins table query
6. Auto-redirects admins to `/admin`

## Admin Access Control

### Frontend Level
- AuthModal checks admin_whitelist on signup
- AuthModal checks admins table on admin login attempts
- AdminRoute component blocks non-admins from accessing `/admin`

### Database Level
- Row Level Security (RLS) policies restrict access to tables
- admins table: Only service role and authenticated admins can query
- admin_whitelist: Only service role can access
- users table: Users can only view/update their own records

### Authorization
Admin access requires:
1. Email must be in admin_whitelist table (approved=true)
2. User must exist in admins table
3. Both tables are checked at login time

## Managing Admins

### Add New Admin Email
1. Go to Supabase dashboard
2. Table Editor → admin_whitelist
3. Insert new row with email and approved=true

### Remove Admin Access
Delete the user's record from the admins table (users table record persists)

### Reset Admin Password
Use Supabase Auth dashboard to reset user password

## Error Messages

- **"Invalid Admin Registration Email. Authorization denied."** - Email not in admin_whitelist
- **"Access Denied: This account is not registered as an administrator."** - User not in admins table
- **"Access Denied: This account is not authorized as an administrator."** - Attempting admin login but not verified

## Security Features

✅ No hardcoded admin emails in frontend code
✅ Database-driven admin validation
✅ Row Level Security policies enforce access control
✅ Automatic user record creation via database triggers
✅ Email verification required before full access
✅ OAuth and email/password both create user records
✅ Admin role verified at both frontend and database levels

## Troubleshooting

### User not being created
- Check if database trigger is active: `select * from pg_trigger where tgname = 'on_auth_user_created';`
- Verify Supabase Auth event is firing
- Check browser console for errors

### Admin signup blocked
- Verify email is in admin_whitelist table and approved=true
- Check email case sensitivity (emails are stored lowercased)
- Confirm user exists in auth.users after signup

### Admin not redirecting to dashboard
- Verify user record exists in admins table
- Check browser console for role detection
- Clear browser cache and refresh

### Google OAuth not creating user
- Verify onAuthStateChange listener is active in App.tsx
- Check browser network tab for Supabase requests
- Ensure Google OAuth is configured in Supabase dashboard
