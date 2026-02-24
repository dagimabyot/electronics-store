# How to Fix RLS Policy for Signup

The profiles table needs proper Row Level Security (RLS) to allow signup data to be saved. Follow these steps:

## Option 1: Disable RLS (Quick Fix - Not Recommended for Production)

1. Go to https://supabase.com/dashboard/project/cncejkyoadvejmlehgsj/editor
2. Click on the `profiles` table
3. Click the lock icon in the top right corner
4. Toggle **RLS** to OFF
5. Test the signup form - data should now save

## Option 2: Fix RLS Policies (Recommended)

1. Go to https://supabase.com/dashboard/project/cncejkyoadvejmlehgsj/auth/policies
2. Find the `profiles` table
3. Delete all existing policies
4. Create these policies:

### INSERT Policy (Allow Signup)
- Click "New Policy" → "For signup"
- Or manually create with:
```sql
CREATE POLICY "allow_insert_on_signup"
ON profiles
FOR INSERT
WITH CHECK (true);
```

### SELECT Policy (Users See Their Own)
```sql
CREATE POLICY "users_see_own_profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);
```

### UPDATE Policy (Users Update Their Own)
```sql
CREATE POLICY "users_update_own_profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);
```

## Testing

After fixing RLS:
1. Go back to the app
2. Try signing up as a customer or admin
3. Check the `profiles` table in Supabase dashboard to see if data was saved
4. The data should appear under the `profiles` table with the user's email, name, and role

## What's Wrong Now?

The INSERT policy is currently blocking profile creation during signup because:
- The RLS policy requires the user to already exist in auth.users
- But the profile insert happens immediately after signup
- There might be a timing issue or the policy is too restrictive

Disabling RLS temporarily will confirm this is the issue.
