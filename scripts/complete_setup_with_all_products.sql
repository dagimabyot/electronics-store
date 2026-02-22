-- ============================================
-- COMPLETE SUPABASE SETUP WITH ALL PRODUCTS
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
-- 5. SEED ALL PRODUCTS
-- ============================================

-- SMARTPHONES
INSERT INTO products (id, brand, name, price, images, category, stock, description) VALUES
('PHONE-001', 'Apple', 'iPhone 15 Pro Max Titanium', 1199, ARRAY['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800', 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800', 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', 'https://images.unsplash.com/photo-1610945661006-4147ecba0660?w=800', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'], 'Smartphones', 50, 'Premium flagship smartphone'),
('PHONE-002', 'Samsung', 'Galaxy S24 Ultra 512GB', 1299, ARRAY['https://images.unsplash.com/photo-1707064406087-0b6167812739?w=800', 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800', 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800', 'https://images.unsplash.com/photo-1698122410604-c85a1e6901e0?w=800', 'https://images.unsplash.com/photo-1610945661006-4147ecba0660?w=800', 'https://images.unsplash.com/photo-1511525036039-24e542ba16da?w=800'], 'Smartphones', 50, 'Advanced Android flagship'),
('PHONE-003', 'Google', 'Pixel 8 Pro 128GB Bay Blue', 999, ARRAY['https://images.unsplash.com/photo-1696602359489-09f485750d94?w=800', 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800', 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', 'https://images.unsplash.com/photo-1610945661006-4147ecba0660?w=800', 'https://images.unsplash.com/photo-1523536331684-60db3d36298c?w=800'], 'Smartphones', 45, 'AI-powered Google smartphone'),
('PHONE-004', 'Nothing', 'Nothing Phone (2) Dark Grey', 649, ARRAY['https://images.unsplash.com/photo-1688649102473-099b9d16aa32?w=800', 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800', 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', 'https://images.unsplash.com/photo-1610945661006-4147ecba0660?w=800', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'], 'Smartphones', 40, 'Unique design Android phone'),
('PHONE-005', 'OnePlus', 'OnePlus 12 Flowy Emerald', 799, ARRAY['https://images.unsplash.com/photo-1711200383120-f1395c808f9c?w=800', 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800', 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800', 'https://images.unsplash.com/photo-1698122410604-c85a1e6901e0?w=800', 'https://images.unsplash.com/photo-1610945661006-4147ecba0660?w=800', 'https://images.unsplash.com/photo-1523536331684-60db3d36298c?w=800'], 'Smartphones', 55, 'Performance-focused Android'),
('PHONE-006', 'Samsung', 'Galaxy Z Fold 5 Graphite', 1799, ARRAY['https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=800', 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800', 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800', 'https://images.unsplash.com/photo-1698122410604-c85a1e6901e0?w=800', 'https://images.unsplash.com/photo-1610945661006-4147ecba0660?w=800', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'], 'Smartphones', 30, 'Foldable flagship phone'),
('PHONE-007', 'Sony', 'Xperia 1 V 4K OLED Phone', 1399, ARRAY['https://images.unsplash.com/photo-1610945661006-4147ecba0660?w=800', 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800', 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', 'https://images.unsplash.com/photo-1723296126099-b2b28cb35d73?w=800', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'], 'Smartphones', 25, 'Professional camera phone'),
('PHONE-008', 'Apple', 'iPhone 15 Plus Pink 128GB', 899, ARRAY['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800', 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800', 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', 'https://images.unsplash.com/photo-1610945661006-4147ecba0660?w=800', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'], 'Smartphones', 60, 'Large iPhone option'),
('PHONE-009', 'Google', 'Pixel 7a Charcoal Compact', 499, ARRAY['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800', 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800', 'https://images.unsplash.com/photo-1698122410604-c85a1e6901e0?w=800', 'https://images.unsplash.com/photo-1610945661006-4147ecba0660?w=800', 'https://images.unsplash.com/photo-1523536331684-60db3d36298c?w=800'], 'Smartphones', 65, 'Budget Google phone'),
('PHONE-010', 'Motorola', 'Motorola Razr+ Flip 2024', 999, ARRAY['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800', 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800', 'https://images.unsplash.com/photo-1698122410604-c85a1e6901e0?w=800', 'https://images.unsplash.com/photo-1610945661006-4147ecba0660?w=800', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'], 'Smartphones', 35, 'Modern flip phone');

-- LAPTOPS
INSERT INTO products (id, brand, name, price, images, category, stock, description) VALUES
('LAPTOP-001', 'Apple', 'MacBook Pro 14 M3 Max 36GB', 3199, ARRAY['https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800'], 'Laptops', 20, 'Professional Apple laptop'),
('LAPTOP-002', 'Dell', 'XPS 15 9530 i9 32GB 1TB', 2199, ARRAY['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800', 'https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800'], 'Laptops', 25, 'Premium Dell workstation'),
('LAPTOP-003', 'HP', 'Spectre x360 14-inch OLED', 1499, ARRAY['https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?w=800', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800'], 'Laptops', 30, 'Convertible HP laptop'),
('LAPTOP-004', 'Lenovo', 'ThinkPad X1 Carbon Gen 12', 1899, ARRAY['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800', 'https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800'], 'Laptops', 28, 'Business ThinkPad'),
('LAPTOP-005', 'Razer', 'Blade 16 RTX 4090 Gaming', 4299, ARRAY['https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800', 'https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800'], 'Laptops', 15, 'High-end gaming laptop'),
('LAPTOP-006', 'Asus', 'ROG Zephyrus G16 OLED 2024', 2699, ARRAY['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800', 'https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800'], 'Laptops', 22, 'Gaming OLED laptop'),
('LAPTOP-007', 'Microsoft', 'Surface Laptop 5 13.5-inch', 1299, ARRAY['https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800'], 'Laptops', 32, 'Sleek Microsoft laptop'),
('LAPTOP-008', 'Apple', 'MacBook Air 15 M3 Space Grey', 1499, ARRAY['https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800'], 'Laptops', 35, 'Portable MacBook Air'),
('LAPTOP-009', 'MSI', 'MSI Raider GE78 HX Gaming', 3599, ARRAY['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800', 'https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800'], 'Laptops', 18, 'Gaming MSI workstation'),
('LAPTOP-010', 'Dell', 'Alienware m18 R2 Desktop Replacement', 2899, ARRAY['https://images.unsplash.com/photo-1580522154071-c6ca47a859ad?w=800', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', 'https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800', 'https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800'], 'Laptops', 16, 'Desktop replacement gaming');

-- ACCESSORIES & TABLETS
INSERT INTO products (id, brand, name, price, images, category, stock, description) VALUES
('ACC-001', 'Apple', 'iPad Pro 12.9 Liquid Retina XDR', 1099, ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=800', 'https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800'], 'Accessories', 40, 'Premium iPad Pro'),
('ACC-002', 'Samsung', 'Galaxy Tab S9+ Android Tablet', 999, ARRAY['https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=800', 'https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800'], 'Accessories', 35, 'Samsung premium tablet'),
('ACC-003', 'Apple', 'iPad Air 10.9-inch Space Grey', 599, ARRAY['https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=800', 'https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800'], 'Accessories', 50, 'Mid-range iPad Air'),
('ACC-004', 'Microsoft', 'Surface Pro 9 i7 16GB 256GB', 1299, ARRAY['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=800', 'https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800'], 'Accessories', 30, 'Microsoft 2-in-1'),
('ACC-005', 'Lenovo', 'Tab P12 Pro Entertainment Tablet', 699, ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=800', 'https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800'], 'Accessories', 45, 'Entertainment tablet'),
('ACC-006', 'Amazon', 'Fire Max 11 Tablet 64GB', 229, ARRAY['https://images.unsplash.com/photo-1583573636246-18cb2246697f?w=800', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=800'], 'Accessories', 70, 'Budget tablet'),
('ACC-007', 'Google', 'Pixel Tablet Hazel with Dock', 499, ARRAY['https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=800', 'https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800'], 'Accessories', 40, 'Google tablet with dock'),
('ACC-008', 'Xiaomi', 'Xiaomi Pad 6S Pro 12.4', 549, ARRAY['https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=800', 'https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800'], 'Accessories', 35, 'Budget pro tablet'),
('ACC-009', 'Apple', 'iPad Mini 6th Gen 64GB Purple', 499, ARRAY['https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=800', 'https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800'], 'Accessories', 55, 'Compact iPad Mini'),
('ACC-010', 'Samsung', 'Galaxy Tab A9+ Budget Friendly', 219, ARRAY['https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?w=800', 'https://images.unsplash.com/photo-1593784991095-a205039475fe?w=800'], 'Accessories', 60, 'Budget Samsung tablet');

-- HEADPHONES
INSERT INTO products (id, brand, name, price, images, category, stock, description) VALUES
('AUDIO-001', 'Sony', 'WH-1000XM5 Noise Cancelling Silver', 349, ARRAY['https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800', 'https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800', 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800', 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800'], 'Headphones', 70, 'Premium noise-canceling'),
('AUDIO-002', 'Bose', 'QuietComfort Ultra Over-Ear White', 429, ARRAY['https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800', 'https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800', 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800', 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800'], 'Headphones', 50, 'Comfort-focused headphones'),
('AUDIO-003', 'Apple', 'AirPods Pro 2nd Gen USB-C ANC', 249, ARRAY['https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800', 'https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800', 'https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800', 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800'], 'Headphones', 80, 'Apple true wireless'),
('AUDIO-004', 'Sennheiser', 'Momentum 4 Wireless Graphite Black', 379, ARRAY['https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800', 'https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800', 'https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800', 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800'], 'Headphones', 60, 'Long-lasting wireless'),
('AUDIO-005', 'JBL', 'Tour One M2 Professional Headphones', 299, ARRAY['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800', 'https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800', 'https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800', 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800', 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800'], 'Headphones', 55, 'Professional JBL'),
('AUDIO-006', 'Marshall', 'Major IV Wireless 80h Playtime', 149, ARRAY['https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800', 'https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800', 'https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800', 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800', 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'], 'Headphones', 75, 'Budget Marshall'),
('AUDIO-007', 'Beats', 'Beats Studio Pro Deep Navy', 349, ARRAY['https://images.unsplash.com/photo-1545127398-14699f92334b?w=800', 'https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800', 'https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800', 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800', 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'], 'Headphones', 65, 'Studio Beats headphones'),
('AUDIO-008', 'Sony', 'WF-1000XM5 Premium Earbuds Black', 299, ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', 'https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800', 'https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800', 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800', 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'], 'Headphones', 70, 'Premium Sony earbuds'),
('AUDIO-009', 'Anker', 'Soundcore Space Q45 ANC', 199, ARRAY['https://images.unsplash.com/photo-1611339555312-e607c90352fd?w=800', 'https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800', 'https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800', 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800', 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'], 'Headphones', 85, 'Budget noise-canceling'),
('AUDIO-010', 'Bang & Olufsen', 'Beoplay H95 Premium', 995, ARRAY['https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800', 'https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800', 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800', 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800'], 'Headphones', 20, 'Luxury headphones');

-- ============================================
-- 6. VERIFY SETUP
-- ============================================
SELECT COUNT(*) as total_products FROM products;
