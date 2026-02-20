# Database Setup - ONE SQL File to Run

## Which File to Use?
**Use ONLY this file:** `scripts/FINAL_AUTH_SETUP.sql`

---

## Step-by-Step Setup

### 1. Open Supabase Dashboard
- Go to https://cncejkyoadvejmlehgsj.supabase.co
- Click **SQL Editor** (left menu)
- Click **New Query** button

### 2. Copy the SQL
- Open this file: `scripts/FINAL_AUTH_SETUP.sql`
- Select ALL content (Ctrl+A or Cmd+A)
- Copy it (Ctrl+C or Cmd+C)

### 3. Paste into Supabase
- Click in the SQL editor text area
- Paste the entire SQL script (Ctrl+V or Cmd+V)
- Do NOT modify anything

### 4. Run the SQL
- Click the **▶ Run** button (or press Ctrl+Enter)
- Wait 10-30 seconds for completion
- You should see green checkmarks and results

### 5. Verify Success
At the bottom, you should see:
```
check_name          | count
==================|=======
USERS TABLE        | 0
ADMIN WHITELIST    | 3
ADMINS             | 0

Admin Emails in Whitelist:
admin@electra.com
admin@example.com
test.admin@electra.com
```

If you see this ✅ **SETUP IS COMPLETE!**

---

## What Gets Created

| Item | Description |
|------|-------------|
| `users` table | All authenticated users (customers + admins) |
| `admin_whitelist` table | List of 3 approved admin emails |
| `admins` table | Verified admin accounts |
| Functions | `is_admin_email()` and `is_user_admin()` |
| Trigger | Auto-creates user records on signup |
| Policies | Row Level Security for safety |

---

## Authentication Flows After Setup

### Customer Signup
1. User enters email: `test@example.com`
2. User enters password: `password123`
3. ✅ Signup succeeds
4. ✅ User record auto-created with role = 'customer'

### Admin Signup (Valid)
1. User clicks Admin tab
2. User enters email: `admin@electra.com`
3. User enters password: `password123`
4. ✅ Email found in whitelist
5. ✅ Signup succeeds
6. ✅ User record auto-created with role = 'admin'
7. ✅ Auto-redirects to admin dashboard

### Admin Signup (Invalid)
1. User clicks Admin tab
2. User enters email: `nope@example.com`
3. User enters password: `password123`
4. ❌ Email NOT in whitelist
5. ❌ Error shown: "Invalid Admin Registration Email. Authorization denied."

### Google OAuth
1. User clicks "Continue with Google"
2. ✅ Authenticates with Google
3. ✅ User record auto-created with provider = 'google'
4. ✅ If email in whitelist → role = 'admin'
5. ✅ If email not in whitelist → role = 'customer'

---

## Troubleshooting

### Error: "column 'approved' does not exist"
- This means old SQL script ran
- Go to Table Editor
- Delete tables: `users`, `admin_whitelist`, `admins`
- Run `FINAL_AUTH_SETUP.sql` again

### Error: "permission denied"
- You need admin access to Supabase
- Ask project owner

### Blank results
- Scroll down to see verification results
- Check all 3 tables exist in Table Editor

---

## Next Steps

1. ✅ Run this SQL script
2. Test signup flows (5 min)
3. Frontend code already updated
4. Deploy to Vercel

**Your database is now ready for enterprise-grade authentication!**
