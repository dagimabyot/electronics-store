-- Safe Migration Script - Only creates what doesn't exist

-- Step 1: Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Enable Row Level Security on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop and recreate RLS policies for profiles
DROP POLICY IF EXISTS "Users can see their own profile" ON profiles;
CREATE POLICY "Users can see their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
CREATE POLICY "Enable insert for authenticated users"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 4: Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  userId UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Shipped', 'Delivered')),
  total DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL,
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop and recreate RLS policy for orders
DROP POLICY IF EXISTS "Users can see their own orders" ON orders;
CREATE POLICY "Users can see their own orders"
  ON orders
  FOR SELECT
  USING (auth.uid() = userId);

-- Step 7: Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  images TEXT[] NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  specs JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders(userId);

-- Done! Tables and policies are now ready.
