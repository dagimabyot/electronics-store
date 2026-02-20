-- Create users table to track all authenticated users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  provider VARCHAR(50) NOT NULL DEFAULT 'email',
  role VARCHAR(50) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create admin_whitelist table to control which emails can be admins
CREATE TABLE IF NOT EXISTS public.admin_whitelist (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create admins table to track authorized admin users
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Enable RLS for admin_whitelist table
ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;

-- Enable RLS for admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- RLS policies for users table
-- Allow users to read their own record
CREATE POLICY "Users can read their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own record during signup
CREATE POLICY "Users can insert their own record"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to update their own record
CREATE POLICY "Users can update their own record"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS policies for admin_whitelist table
-- Allow anyone to read the whitelist (needed for signup validation)
CREATE POLICY "Whitelist is readable by anyone"
  ON public.admin_whitelist
  FOR SELECT
  USING (true);

-- RLS policies for admins table
-- Allow admins to read all admin records
CREATE POLICY "Admins can read admin records"
  ON public.admins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- Allow users to read their own admin record if they're an admin
CREATE POLICY "Users can read their own admin record"
  ON public.admins
  FOR SELECT
  USING (auth.uid() = id);

-- Allow inserting admin records (called from server-side or function)
CREATE POLICY "Admin records can be inserted"
  ON public.admins
  FOR INSERT
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_admin_whitelist_email ON public.admin_whitelist(email);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);

-- Seed initial admin whitelist
INSERT INTO public.admin_whitelist (email) VALUES 
  ('admin@electra.com'),
  ('admin@example.com'),
  ('test.admin@electra.com')
ON CONFLICT (email) DO NOTHING;

-- Create a function to automatically create user record after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, provider, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    'customer'
  )
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to call the function after signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
