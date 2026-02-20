-- ============================================================================
-- COMPLETE AUTHENTICATION SETUP - ELECTRA E-COMMERCE
-- Copy and paste THIS ENTIRE SCRIPT into Supabase SQL Editor
-- ============================================================================

-- STEP 1: CREATE USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'email',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Stores all authenticated users (customers and admins)';

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- STEP 2: CREATE ADMIN WHITELIST TABLE
CREATE TABLE IF NOT EXISTS admin_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE admin_whitelist IS 'List of emails authorized to register as admins';

ALTER TABLE admin_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage whitelist" ON admin_whitelist
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_admin_whitelist_email ON admin_whitelist(LOWER(email));

-- Add default admin emails
INSERT INTO admin_whitelist (email) VALUES 
  ('admin@electra.com'),
  ('admin@example.com'),
  ('test.admin@electra.com')
ON CONFLICT (email) DO NOTHING;

-- STEP 3: CREATE ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE admins IS 'Verified admin users - only users in this table can access admin panel';

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage admins" ON admins
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated can view admin list" ON admins
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(LOWER(email));

-- STEP 4: CREATE HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION is_admin_email(email_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_whitelist 
    WHERE LOWER(email) = LOWER(email_to_check)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: CREATE TRIGGER FOR AUTO USER CREATION
CREATE OR REPLACE FUNCTION handle_auth_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  provider_name TEXT;
  user_is_admin BOOLEAN;
BEGIN
  -- Determine provider
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
  -- Log but don't fail
  RAISE NOTICE 'Error in handle_auth_user_signup: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if present
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_signup();

-- STEP 6: GRANT PERMISSIONS
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON admin_whitelist TO authenticated;
GRANT SELECT ON admins TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_email(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated, anon;

-- STEP 7: VERIFICATION QUERIES (check results below)
SELECT 'USERS TABLE' as check_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'ADMIN WHITELIST', COUNT(*) FROM admin_whitelist
UNION ALL
SELECT 'ADMINS', COUNT(*) FROM admins;

SELECT 'Admin Emails in Whitelist:' as info;
SELECT email FROM admin_whitelist ORDER BY email;

-- ============================================================================
-- SETUP COMPLETE!
-- Your authentication system is ready for:
-- ✓ Customer signup/login with email or Google
-- ✓ Admin signup with whitelist validation
-- ✓ Automatic user record creation
-- ✓ Role-based access control
-- ============================================================================
