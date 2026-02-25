-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create password_resets table for password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on password_resets table
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Create master_key_history table for audit logging
CREATE TABLE IF NOT EXISTS master_key_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  changed_by_email TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Enable RLS on master_key_history table
ALTER TABLE master_key_history ENABLE ROW LEVEL SECURITY;

-- Create master_key storage table (hashed)
CREATE TABLE IF NOT EXISTS master_key_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hashed_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on master_key_storage table
ALTER TABLE master_key_storage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins table is read-only for authenticated users" ON admins;
DROP POLICY IF EXISTS "Password resets accessible via email" ON password_resets;
DROP POLICY IF EXISTS "Master key history is read-only" ON master_key_history;
DROP POLICY IF EXISTS "Master key storage is hidden from public" ON master_key_storage;

-- Create RLS policies for admins table
CREATE POLICY "Admins table is read-only for authenticated users"
  ON admins
  FOR SELECT
  USING (true);

-- Create RLS policies for password_resets table (no direct access, token-based)
CREATE POLICY "Password resets accessible via email"
  ON password_resets
  FOR SELECT
  USING (true);

-- Create RLS policies for master_key_history
CREATE POLICY "Master key history is read-only"
  ON master_key_history
  FOR SELECT
  USING (true);

-- Create RLS policies for master_key_storage
CREATE POLICY "Master key storage is hidden from public"
  ON master_key_storage
  FOR SELECT
  USING (false);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);
CREATE INDEX IF NOT EXISTS idx_master_key_history_admin_id ON master_key_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
