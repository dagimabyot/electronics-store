-- ============================================================================
-- SIMPLE AUTHENTICATION SETUP FOR ELECTRA E-COMMERCE
-- Copy and paste THIS entire script into Supabase SQL Editor and run it
-- ============================================================================

-- Drop existing tables if they exist (comment out after first run)
-- DROP TABLE IF EXISTS admins CASCADE;
-- DROP TABLE IF EXISTS admin_whitelist CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 1. CREATE USERS TABLE (tracks all authenticated users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'email',
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own record
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow service role to manage
CREATE POLICY "Service role can do anything" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- 2. CREATE ADMIN WHITELIST TABLE (controls who can be admin)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_whitelist ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage
CREATE POLICY "Service role can do anything" ON admin_whitelist
  FOR ALL USING (auth.role() = 'service_role');

-- Insert approved admin emails
INSERT INTO admin_whitelist (email, approved) VALUES 
  ('admin@electra.com', true),
  ('admin@example.com', true),
  ('test.admin@electra.com', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 3. CREATE ADMINS TABLE (stores verified admin users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage
CREATE POLICY "Service role can do anything" ON admins
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to view
CREATE POLICY "Authenticated can view" ON admins
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- ============================================================================
-- 4. CREATE FUNCTIONS FOR VALIDATION
-- ============================================================================

-- Function to check if email is in admin whitelist
CREATE OR REPLACE FUNCTION is_admin_email(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_whitelist 
    WHERE LOWER(email) = LOWER(check_email) 
    AND approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. CREATE TRIGGER TO AUTO-CREATE USER RECORDS
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_admin BOOLEAN;
  provider_type TEXT;
BEGIN
  -- Detect provider
  IF NEW.raw_app_meta_data->>'provider' = 'google' THEN
    provider_type := 'google';
  ELSE
    provider_type := 'email';
  END IF;

  -- Check if email is admin
  is_admin := is_admin_email(NEW.email);

  -- Create user record
  INSERT INTO users (id, email, provider, role)
  VALUES (
    NEW.id,
    NEW.email,
    provider_type,
    CASE WHEN is_admin THEN 'admin' ELSE 'customer' END
  );

  -- If admin, create admin record
  IF is_admin THEN
    INSERT INTO admins (id, email, role)
    VALUES (NEW.id, NEW.email, 'admin');
  END IF;

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Silently ignore duplicate key errors
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON users TO authenticated;
GRANT SELECT ON admins TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_email(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated, anon;

-- ============================================================================
-- 7. VERIFY SETUP (Run these queries to check)
-- ============================================================================

-- Check tables created
SELECT 'users' as table_name, (SELECT COUNT(*) FROM users) as count
UNION ALL
SELECT 'admin_whitelist', (SELECT COUNT(*) FROM admin_whitelist)
UNION ALL
SELECT 'admins', (SELECT COUNT(*) FROM admins);

-- Check admin whitelist
SELECT email, approved FROM admin_whitelist ORDER BY email;

-- ============================================================================
-- DONE! Your authentication database is ready.
-- ============================================================================
