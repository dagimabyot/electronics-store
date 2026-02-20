-- Create admin_whitelist table to control who can be an admin
CREATE TABLE IF NOT EXISTS public.admin_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  approved_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_whitelist_email ON public.admin_whitelist(email);

-- Enable RLS on admin_whitelist (only service role can modify)
ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can manage whitelist
CREATE POLICY "Service role manages whitelist"
  ON public.admin_whitelist
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Authenticated users can check if their email is whitelisted
CREATE POLICY "Users can check whitelist for their email"
  ON public.admin_whitelist
  FOR SELECT
  USING (email = auth.jwt() ->> 'email');

-- Create admins table to store admin user records
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);

-- Enable RLS on admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read their own data
CREATE POLICY "Admins can read their own data"
  ON public.admins
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Service role can read all admins
CREATE POLICY "Service role can manage all admins"
  ON public.admins
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Authenticated users can insert their own admin record if whitelisted
CREATE POLICY "Whitelisted users can create admin record"
  ON public.admins
  FOR INSERT
  WITH CHECK (
    auth.uid() = id AND 
    EXISTS (
      SELECT 1 FROM public.admin_whitelist 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.admin_whitelist TO authenticated;
GRANT SELECT ON public.admins TO anon, authenticated;
GRANT INSERT ON public.admins TO authenticated;
GRANT UPDATE ON public.admins TO authenticated;
