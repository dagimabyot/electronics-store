-- Add email column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Drop and recreate policies to fix the issue
DROP POLICY IF EXISTS "Enable insert from service role" ON profiles;
DROP POLICY IF EXISTS "Enable insert for signup" ON profiles;

-- Create a single INSERT policy that allows signup
CREATE POLICY "Enable insert for signup"
  ON profiles
  FOR INSERT
  WITH CHECK (true);
