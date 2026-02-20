-- Step 3: Create database functions for auth operations

-- Function to check if email is admin
CREATE OR REPLACE FUNCTION is_admin_email(email_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_whitelist 
    WHERE LOWER(admin_whitelist.email) = LOWER(email_to_check) 
    AND approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user after signup
CREATE OR REPLACE FUNCTION create_user_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  provider_name TEXT;
BEGIN
  -- Determine provider based on raw_user_meta_data
  IF NEW.raw_user_meta_data ? 'provider' THEN
    provider_name := NEW.raw_user_meta_data->>'provider';
  ELSE
    provider_name := 'email';
  END IF;

  -- Insert into users table
  INSERT INTO users (id, email, provider, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(provider_name, 'email'),
    CASE 
      WHEN is_admin_email(NEW.email) THEN 'admin'
      ELSE 'customer'
    END
  )
  ON CONFLICT (email) DO UPDATE SET
    provider = EXCLUDED.provider,
    updated_at = NOW();

  -- If admin, also insert into admins table
  IF is_admin_email(NEW.email) THEN
    INSERT INTO admins (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (email) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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

-- Function to update last login
CREATE OR REPLACE FUNCTION update_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE admins SET last_login = NOW() WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_admin_email(TEXT) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION verify_admin_access(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_admin_last_login() TO authenticated;
