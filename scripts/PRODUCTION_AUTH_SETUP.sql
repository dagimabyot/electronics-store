-- ============================================================================
-- PRODUCTION AUTHENTICATION SETUP - ELECTRA E-COMMERCE
-- Run this ENTIRE script in Supabase SQL Editor
-- Copy ALL content and paste into "New Query" then click Run
-- ============================================================================

-- DROP old objects if they exist (clean slate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS handle_auth_user_signup() CASCADE;
DROP FUNCTION IF EXISTS is_admin_email(TEXT) CASCADE;
DROP FUNCTION IF EXISTS is_user_admin(UUID) CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS admin_whitelist CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 1. USERS TABLE - All authenticated users
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'email',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own record" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Service role manages users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 2. ADMIN WHITELIST TABLE - Who can become admin
-- ============================================================================
CREATE TABLE admin_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages whitelist" ON admin_whitelist
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_admin_whitelist_email ON admin_whitelist(LOWER(email));

-- Insert approved admin emails
INSERT INTO admin_whitelist (email) VALUES 
  ('admin@electra.com'),
  ('admin@example.com'),
  ('test.admin@electra.com')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 3. ADMINS TABLE - Verified admins only
-- ============================================================================
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages admins" ON admins
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated can view admins" ON admins
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX idx_admins_email ON admins(LOWER(email));

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Check if email is in whitelist
CREATE OR REPLACE FUNCTION is_admin_email(email_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_whitelist 
    WHERE LOWER(email) = LOWER(email_to_check)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. TRIGGER - Auto-create user records on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_auth_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  provider_name TEXT;
  user_is_admin BOOLEAN;
BEGIN
  -- Get provider from auth metadata
  provider_name := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  
  -- Check if email is in whitelist
  user_is_admin := is_admin_email(NEW.email);

  -- Insert into users table
  INSERT INTO users (id, email, provider, role)
  VALUES (
    NEW.id,
    NEW.email,
    provider_name,
    CASE WHEN user_is_admin THEN 'admin' ELSE 'customer' END
  )
  ON CONFLICT (id) DO NOTHING;

  -- If admin, add to admins table
  IF user_is_admin THEN
    INSERT INTO admins (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in handle_auth_user_signup: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_signup();

-- ============================================================================
-- 6. PERMISSIONS
-- ============================================================================

GRANT SELECT ON users TO authenticated;
GRANT SELECT ON admin_whitelist TO authenticated;
GRANT SELECT ON admins TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_email(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated, anon;

-- ============================================================================
-- 7. VERIFICATION QUERIES - Results should appear below
-- ============================================================================

SELECT 'Setup Complete!' as status;

SELECT 'Admin Emails in Whitelist:' as info;
SELECT email FROM admin_whitelist ORDER BY email;

SELECT COUNT(*) as total_admin_emails FROM admin_whitelist;

-- ============================================================================
-- AUTHENTICATION SYSTEM IS READY!
-- ✓ All tables created
-- ✓ Admin whitelist seeded with 3 emails
-- ✓ Trigger auto-creates users on signup
-- ✓ RLS policies enforce security
-- ============================================================================
