-- Step 2: Create admin whitelist and admins tables

-- Admin whitelist - Controls which emails can be admins
CREATE TABLE IF NOT EXISTS admin_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  email_lower TEXT NOT NULL UNIQUE GENERATED ALWAYS AS (LOWER(email)) STORED,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE admin_whitelist ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can manage whitelist
CREATE POLICY "Service role can manage admin whitelist"
  ON admin_whitelist FOR ALL
  USING (auth.role() = 'service_role');

-- Admins table - Stores verified admin users
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

-- Policy: Admins can view all admins (for admin dashboard)
CREATE POLICY "Admins can view admin list"
  ON admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    )
  );

-- Policy: Service role can manage admins table
CREATE POLICY "Service role can manage admins"
  ON admins FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Users can view their own admin record
CREATE POLICY "Users can view their own admin record"
  ON admins FOR SELECT
  USING (id = auth.uid());

-- Create index on email_lower for fast lookups
CREATE INDEX idx_admins_email_lower ON admins(email_lower);
CREATE INDEX idx_admin_whitelist_email_lower ON admin_whitelist(email_lower);

-- Seed initial admin whitelist
INSERT INTO admin_whitelist (email) VALUES 
  ('admin@electra.com'),
  ('admin@example.com'),
  ('test.admin@electra.com')
ON CONFLICT (email) DO NOTHING;

GRANT SELECT ON admin_whitelist TO service_role;
GRANT SELECT ON admins TO authenticated;
GRANT SELECT ON admins TO anon;
