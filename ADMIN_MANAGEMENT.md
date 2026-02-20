# Admin Management Guide

## Quick Reference

### View All Admin Whitelist Emails
Go to **Supabase Dashboard** → **SQL Editor** → Run:
```sql
SELECT email, created_at FROM public.admin_whitelist ORDER BY created_at DESC;
```

### View All Authorized Admins
Go to **Supabase Dashboard** → **SQL Editor** → Run:
```sql
SELECT email, role, created_at FROM public.admins ORDER BY created_at DESC;
```

### View All Users (Customers & Admins)
Go to **Supabase Dashboard** → **SQL Editor** → Run:
```sql
SELECT email, provider, role, created_at FROM public.users ORDER BY created_at DESC;
```

---

## Adding a New Admin

### Method 1: Via Database (Recommended)

1. **Add email to whitelist** (allows them to signup):
   ```sql
   INSERT INTO public.admin_whitelist (email) 
   VALUES ('newadmin@company.com');
   ```

2. **Send signup link** to the new admin
   - They register via "Admin Terminal" tab on login screen
   - Email must match whitelist
   - System automatically creates `admins` table record
   - They verify email and can login

### Method 2: Manual Creation (For Testing/Emergency)

If you need to create an admin manually without email verification:

1. **User must have a Supabase auth account first**
   - They can signup as customer, then you upgrade them
   - OR you create via Supabase Dashboard: Authentication → Users → Add user

2. **Add to whitelist**:
   ```sql
   INSERT INTO public.admin_whitelist (email) 
   VALUES ('admin@example.com')
   ON CONFLICT (email) DO NOTHING;
   ```

3. **Add to users table**:
   ```sql
   INSERT INTO public.users (id, email, provider, role) 
   VALUES ('user-id-from-auth', 'admin@example.com', 'email', 'admin')
   ON CONFLICT (email) DO NOTHING;
   ```

4. **Add to admins table**:
   ```sql
   INSERT INTO public.admins (id, email, role) 
   VALUES ('user-id-from-auth', 'admin@example.com', 'admin')
   ON CONFLICT (email) DO NOTHING;
   ```

---

## Removing an Admin

### Method 1: Remove from Whitelist Only (Prevents New Signup)
```sql
DELETE FROM public.admin_whitelist 
WHERE email = 'admin@example.com';
```
Existing admins keep their access.

### Method 2: Remove Admin Access (Deactivate)
```sql
DELETE FROM public.admins 
WHERE email = 'admin@example.com';
```
User can still login as customer, but loses admin access.

### Method 3: Complete Removal (Delete User Account)
```sql
-- This will cascade delete from users and admins tables
DELETE FROM auth.users 
WHERE email = 'admin@example.com';
```
User loses all access, account fully deleted.

---

## Updating Admin Information

### Change Admin Email
```sql
UPDATE public.admins 
SET email = 'newemail@company.com' 
WHERE email = 'oldemail@company.com';

UPDATE public.users 
SET email = 'newemail@company.com' 
WHERE email = 'oldemail@company.com';
```

---

## Monitoring & Auditing

### View Admin Login History
```sql
-- Check when admins were created
SELECT email, created_at FROM public.admins 
ORDER BY created_at DESC;

-- Check all users by role
SELECT email, role, created_at FROM public.users 
WHERE role = 'admin' 
ORDER BY created_at DESC;
```

### Find Customers
```sql
SELECT email, provider, created_at FROM public.users 
WHERE role = 'customer' 
ORDER BY created_at DESC;
```

### Count Users by Role
```sql
SELECT role, COUNT(*) as count FROM public.users 
GROUP BY role;
```

---

## Default Admin Whitelist

The system comes with 3 default admin emails:

```sql
SELECT * FROM public.admin_whitelist;
```

**Default Emails:**
- admin@electra.com
- admin@example.com
- test.admin@electra.com

You should change these! Update them in Supabase Dashboard.

---

## Security Best Practices

1. **Review Whitelist Regularly**
   - Keep only necessary admins
   - Remove contractors/temporary access

2. **Use Strong Passwords**
   - Require 12+ characters
   - Mix uppercase, lowercase, numbers, symbols

3. **Enable Email Verification**
   - Supabase → Authentication → Email → Enable "Confirm email"

4. **Monitor New Signups**
   - Regularly check `users` and `admins` tables
   - Verify all new admins were expected

5. **Audit Admin Actions**
   - Log admin activities in your app
   - Review product/order changes

---

## Troubleshooting

### Admin Can't Signup
- ✅ Check email is in `admin_whitelist`
- ✅ Verify email is exact match (case-insensitive)
- ✅ Confirm email hasn't already been used for customer account

### Admin Can't Login
- ✅ Check email in `admins` table
- ✅ Verify email was confirmed
- ✅ Check if account in auth.users

### Can't Find Admin in Database
```sql
-- Search for user by email
SELECT * FROM public.users WHERE email = 'admin@example.com';

-- Check if in admins table
SELECT * FROM public.admins WHERE email = 'admin@example.com';

-- Check whitelist
SELECT * FROM public.admin_whitelist WHERE email = 'admin@example.com';
```

---

## Common SQL Queries

### Search User by Email
```sql
SELECT * FROM public.users WHERE email ILIKE '%youremail%';
```

### Find Duplicate Emails
```sql
SELECT email, COUNT(*) FROM public.users GROUP BY email HAVING COUNT(*) > 1;
```

### Find Inactive Admins (Created >30 days ago)
```sql
SELECT email, created_at FROM public.admins 
WHERE created_at < NOW() - INTERVAL '30 days'
ORDER BY created_at;
```

### Bulk Add Multiple Admins
```sql
INSERT INTO public.admin_whitelist (email) VALUES 
('admin1@company.com'),
('admin2@company.com'),
('admin3@company.com')
ON CONFLICT (email) DO NOTHING;
```

---

## Support

For issues or questions:
1. Check DATABASE_SETUP.md for detailed setup instructions
2. Review browser console for error messages
3. Check Supabase dashboard for database errors
4. Review RLS policies in Supabase SQL editor
