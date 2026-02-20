-- COMPLETE AUTHENTICATION SETUP FOR ELECTRA E-COMMERCE
-- Execute all of this SQL in your Supabase SQL Editor
-- This creates users, admin_whitelist, and admins tables with triggers and RLS

-- ============================================================================
-- STEP 1: Create users table (all authenticated users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL CHECK (provider IN ('email', 'google')),
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage users"
  ON users FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX idx_users_email ON users(email);

CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_timestamp();

GRANT SELECT ON users TO authenticated;
GRANT SELECT ON users TO anon;

-- ============================================================================
-- STEP 2: Create admin whitelist and admins tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  email_lower TEXT NOT NULL UNIQUE GENERATED ALWAYS AS (LOWER(email)) STORED,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE admin_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage admin whitelist"
  ON admin_whitelist FOR ALL
  USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  email_lower TEXT NOT NULL UNIQUE GENERATED ALWAYS AS (LOWER(email)) STORED,
  role TEXT DEFAULT 'admin' CHECK (role = 'admin'),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin list"
  ON admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage admins"
  ON admins FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own admin record"
  ON admins FOR SELECT
  USING (id = auth.uid());

CREATE INDEX idx_admins_email_lower ON admins(email_lower);
CREATE INDEX idx_admin_whitelist_email_lower ON admin_whitelist(email_lower);

-- Seed initial admin whitelist
INSERT INTO admin_whitelist (email, approved) VALUES 
  ('admin@electra.com', true),
  ('admin@example.com', true),
  ('test.admin@electra.com', true)
ON CONFLICT (email_lower) DO NOTHING;

GRANT SELECT ON admin_whitelist TO service_role;
GRANT SELECT ON admins TO authenticated;
GRANT SELECT ON admins TO anon;

-- ============================================================================
-- STEP 3: Create database functions and triggers
-- ============================================================================

-- Function to check if email is in admin whitelist
CREATE OR REPLACE FUNCTION is_admin_email(email_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_whitelist 
    WHERE email_lower = LOWER(email_to_check) 
    AND approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create user records when signing up
CREATE OR REPLACE FUNCTION create_user_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  provider_name TEXT;
  is_admin BOOLEAN;
BEGIN
  -- Determine provider
  provider_name := COALESCE(
    NEW.raw_app_meta_data->>'provider',
    'email'
  );

  -- Check if email is in admin whitelist
  is_admin := is_admin_email(NEW.email);

  -- Insert user record
  INSERT INTO users (id, email, provider, role)
  VALUES (
    NEW.id,
    NEW.email,
    provider_name,
    CASE WHEN is_admin THEN 'admin' ELSE 'customer' END
  )
  ON CONFLICT (id) DO UPDATE SET
    provider = EXCLUDED.provider,
    updated_at = NOW();

  -- If user is admin, create admin record
  IF is_admin THEN
    INSERT INTO admins (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_on_signup();

-- Function to verify admin access
CREATE OR REPLACE FUNCTION verify_admin_access(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last login for admins
CREATE OR REPLACE FUNCTION update_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE admins SET last_login = NOW() WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_admin_email(TEXT) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION verify_admin_access(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_admin_last_login() TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (run these to test)
-- ============================================================================

-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('users', 'admin_whitelist', 'admins');

-- Check admin whitelist
SELECT email, approved FROM admin_whitelist ORDER BY created_at DESC;

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE '%admin%';

-- ============================================================================
-- END OF SETUP
-- ============================================================================
