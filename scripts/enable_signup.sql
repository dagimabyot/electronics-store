-- Drop the restrictive RLS policy if it exists
DROP POLICY IF EXISTS "Enable insert for signup" ON profiles;
DROP POLICY IF EXISTS "Enable insert from service role" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;

-- Create a permissive INSERT policy for signup
-- This allows ANY insert to the profiles table (RLS will be enforced for SELECT/UPDATE)
CREATE POLICY "allow_insert_on_signup"
  ON profiles
  FOR INSERT
  WITH CHECK (true);

-- Alternative SELECT policy - users can only see their own profile
DROP POLICY IF EXISTS "Users can see their own profile" ON profiles;
CREATE POLICY "Users can see their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Alternative UPDATE policy - users can only update their own profile  
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);
