-- Create users table to track all authenticated users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('email', 'google')),
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_whitelist table to manage authorized admin emails
CREATE TABLE IF NOT EXISTS admin_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table to track admin users
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  permissions VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_admin_whitelist_email ON admin_whitelist(email);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_auth_id ON admins(auth_id);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own record
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (auth_id = auth.uid());

-- RLS Policy: Users can update their own record
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth_id = auth.uid());

-- RLS Policy: Service role can manage users (for auth functions)
CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policy: Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = TRUE)
  );

-- RLS Policy: Anyone can view active admin whitelist (for signup validation)
CREATE POLICY "Public can view admin whitelist" ON admin_whitelist
  FOR SELECT USING (is_active = TRUE);

-- RLS Policy: Service role can manage admin whitelist
CREATE POLICY "Service role can manage whitelist" ON admin_whitelist
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policy: Admins can view all admins
CREATE POLICY "Admins can view all admins" ON admins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = TRUE)
  );

-- RLS Policy: Service role can manage admins
CREATE POLICY "Service role can manage admins" ON admins
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Insert default admin emails into whitelist
INSERT INTO admin_whitelist (email, is_active) VALUES
  ('admin@electra.com', TRUE),
  ('admin@example.com', TRUE),
  ('test.admin@electra.com', TRUE)
ON CONFLICT (email) DO NOTHING;
