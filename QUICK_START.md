# Authentication System - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Execute Database Setup (2 minutes)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy all content from: `scripts/auth-setup.sql`
4. Click **Run**

✅ This creates all required tables and enables security!

### Step 2: Test Signup (3 minutes)

#### Test Customer Signup
1. Go to app and click **Sign In**
2. Select **Customer** tab
3. Register with any email (e.g., customer@example.com)
4. See "Account created" message
5. Verify email from inbox
6. ✅ Login to see store

#### Test Admin Signup
1. Go to app and click **Sign In**
2. Select **Admin Terminal** tab
3. Try email NOT in whitelist (e.g., fake@example.com)
   - ❌ Should get error: "Invalid Admin Registration Email. Authorization denied."
4. Try whitelisted email (e.g., admin@electra.com)
   - ✅ Should see: "Admin account created"
5. Verify email
6. ✅ Login and auto-redirect to /admin

---

## 🎯 Default Admin Whitelist

These 3 emails are pre-added and can signup as admins:
- admin@electra.com
- admin@example.com
- test.admin@electra.com

---

## 🔑 Key Features

✅ **Database-Driven**: Admin emails in database, not hardcoded  
✅ **Automatic Records**: Users auto-saved on signup via trigger  
✅ **RLS Protected**: Row Level Security prevents unauthorized access  
✅ **Easy Management**: Add/remove admins via Supabase Dashboard  
✅ **Google OAuth**: Supports Gmail login for customers  
✅ **Auto-Redirect**: Admins automatically sent to /admin on login  
✅ **Email Verification**: Prevents fake accounts  

---

## 📊 Database Tables

### users
Stores all users (customers + admins)
```
id, email, provider, role, created_at, updated_at
```

### admin_whitelist
Controls who can become admin
```
id, email, created_at
```

### admins
Authorized admin users only
```
id, email, role, created_at, updated_at
```

---

## 👥 Managing Admins

### Add New Admin Email
Go to **Supabase** → **SQL Editor** → Run:
```sql
INSERT INTO public.admin_whitelist (email) 
VALUES ('newemail@company.com');
```

### Remove Admin Email
```sql
DELETE FROM public.admin_whitelist 
WHERE email = 'email@company.com';
```

### View All Admins
```sql
SELECT * FROM public.admins;
```

### View Whitelist
```sql
SELECT * FROM public.admin_whitelist;
```

---

## 🧪 Test Cases

### ✅ Customer Email/Password Flow
```
1. Sign In → Customer tab → Register
2. Email: any@example.com, Password: any123
3. Should create customer account
4. Email verification sent
5. Can login to store
```

### ✅ Admin Email/Password Flow
```
1. Sign In → Admin Terminal tab → Register
2. Email: admin@electra.com, Password: any123
3. System checks whitelist
4. Account created
5. Email verification sent
6. Login → Auto-redirect to /admin
```

### ❌ Invalid Admin Email Flow
```
1. Sign In → Admin Terminal tab → Register
2. Email: notadmin@example.com
3. System checks whitelist
4. Error: "Invalid Admin Registration Email. Authorization denied."
```

### ✅ Google OAuth Customer Flow
```
1. Sign In → Customer tab → Continue with Google
2. Complete Google auth
3. Account created with provider='google'
4. Auto-redirect to store
```

---

## 🔐 Security

- **RLS Policies**: All tables protected
- **Email Verification**: Required for account activation
- **Database Validation**: Admin whitelist checked server-side
- **Auto Trigger**: Users saved automatically on signup
- **Encrypted**: Passwords hashed by Supabase

---

## ❓ Troubleshooting

### Admin signup shows error "Invalid Admin Registration Email"
**Fix**: Email not in admin_whitelist. Run this:
```sql
INSERT INTO public.admin_whitelist (email) 
VALUES ('youremail@company.com');
```

### Admin can't login
**Fix**: Check admins table has the record:
```sql
SELECT * FROM public.admins WHERE email = 'youremail@company.com';
```

### Admin not redirecting to /admin
**Fix**: Check browser console for errors, verify user in admins table

### Google login not working
**Fix**: Configure Google OAuth in Supabase → Authentication → Google

---

## 📚 Full Guides

- **DATABASE_SETUP.md** - Complete setup instructions
- **ADMIN_MANAGEMENT.md** - How to manage admin whitelist
- **AUTH_IMPLEMENTATION_SUMMARY.md** - Technical details

---

## ✨ What's New

### Before (Hardcoded)
```typescript
const ADMIN_EMAILS = ['admin@electra.com', ...];
const isAdmin = ADMIN_EMAILS.includes(email);
```

### After (Database-Driven)
```sql
SELECT * FROM admin_whitelist WHERE email = '...';
SELECT * FROM admins WHERE id = user_id;
```

**Benefits:**
- No code changes to add/remove admins
- Audit trail in database
- RLS enforces security
- Easy to manage via Supabase UI

---

## 🚀 Ready to Go!

1. ✅ Execute `scripts/auth-setup.sql`
2. ✅ Test signup flows above
3. ✅ Add more admin emails as needed
4. ✅ Deploy to production

That's it! The system is ready to use.

---

**Questions?** See DATABASE_SETUP.md for detailed information.
