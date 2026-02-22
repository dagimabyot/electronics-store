-- ============================================
-- COMPLETE SUPABASE SETUP - RUN THIS SCRIPT
-- ============================================

-- ============================================
-- 1. DROP EXISTING TABLES (START FRESH)
-- ============================================
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 2. CREATE PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can see their own profile"
  ON profiles FOR SELECT
  USING (auth.uid()::uuid = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::uuid = id);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid()::uuid = id);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. CREATE PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
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

-- Create indexes for products
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);

-- ============================================
-- 4. CREATE ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Shipped', 'Delivered')),
  total DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL,
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for orders
CREATE POLICY "Users can see their own orders"
  ON orders FOR SELECT
  USING (auth.uid()::uuid = "userId");

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid()::uuid = "userId");

CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid()::uuid = "userId");

-- Create index on userId
CREATE INDEX idx_orders_userId ON orders("userId");
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Create trigger for orders updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. SEED SAMPLE PRODUCTS (OPTIONAL)
-- ============================================
INSERT INTO products (id, brand, name, price, images, category, stock, description, specs) VALUES
('1', 'Samsung', 'Galaxy S24 Ultra', 1299.99, ARRAY['https://via.placeholder.com/300'], 'Smartphones', 50, 'Premium flagship smartphone', '{"RAM":"12GB","Storage":"256GB"}'),
('2', 'Apple', 'MacBook Pro 16"', 3499.99, ARRAY['https://via.placeholder.com/300'], 'Laptops', 30, 'Powerful laptop for professionals', '{"Processor":"M4 Max","RAM":"16GB"}'),
('3', 'Sony', 'WH-1000XM5', 399.99, ARRAY['https://via.placeholder.com/300'], 'Headphones', 100, 'Noise-cancelling headphones', '{"Battery":"40hrs"}'),
('4', 'DJI', 'Air 3S', 999.99, ARRAY['https://via.placeholder.com/300'], 'Drones', 20, 'Professional drone', '{"MaxSpeed":"75.6km/h"}'),
('5', 'GoPro', 'Hero 12', 499.99, ARRAY['https://via.placeholder.com/300'], 'Cameras', 45, 'Action camera', '{"Resolution":"5.3K"}')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. VERIFY SETUP
-- ============================================
SELECT 'Profiles table created' as status;
SELECT 'Products table created' as status;
SELECT 'Orders table created' as status;
SELECT COUNT(*) as product_count FROM products;
