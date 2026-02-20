-- Create users table to store all authenticated users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  provider VARCHAR(50) NOT NULL DEFAULT 'email', -- 'email' or 'google'
  role VARCHAR(50) NOT NULL DEFAULT 'customer', -- 'customer' or 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Service role can read all users (for admin checks)
CREATE POLICY "Service role can manage all users"
  ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Authenticated users can insert their own record
CREATE POLICY "Users can insert their own record"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.users TO anon, authenticated;
GRANT INSERT ON public.users TO anon, authenticated;
GRANT UPDATE ON public.users TO anon, authenticated;
