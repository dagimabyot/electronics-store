-- Complete Electra Electronics Setup with ALL 40+ Products

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can see their own profile" ON profiles;
CREATE POLICY "Users can see their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid()::uuid = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid()::uuid = id);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
CREATE POLICY "Enable insert for authenticated users"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid()::uuid = id);

-- Create products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  brand TEXT,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '{}'::jsonb,
  rating DECIMAL(3, 1) DEFAULT 4.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read products
CREATE POLICY "Public can view products"
  ON products
  FOR SELECT
  USING (true);

-- Create orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Paid' CHECK (status IN ('Pending', 'Paid', 'Shipped', 'Delivered')),
  total DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL,
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for orders
DROP POLICY IF EXISTS "Users can see their own orders" ON orders;
CREATE POLICY "Users can see their own orders"
  ON orders
  FOR SELECT
  USING (auth.uid()::uuid = "userId");

-- Create index on userId for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders("userId");

-- ===== INSERT ALL 40+ PRODUCTS =====

-- 1. SMARTPHONES (10 products)
INSERT INTO products (id, name, brand, category, price, stock, description, images, specs) VALUES
('phone-1', 'iPhone 15 Pro Max Titanium', 'Apple', 'Smartphones', 1199, 15, 'Premium flagship with advanced camera and A17 Pro chip', '["https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800", "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800", "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"]', '{"Display": "6.7 inch OLED", "RAM": "8GB", "Storage": "1TB", "Processor": "A17 Pro"}'),
('phone-2', 'Galaxy S24 Ultra 512GB', 'Samsung', 'Smartphones', 1299, 12, 'Ultra premium with 200MP camera and latest Snapdragon', '["https://images.unsplash.com/photo-1707064406087-0b6167812739?w=800", "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800", "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800", "https://images.unsplash.com/photo-1698122410604-c85a1e6901e0?w=800"]', '{"Display": "6.8 inch AMOLED", "RAM": "12GB", "Storage": "512GB", "Processor": "Snapdragon 8 Gen 3"}'),
('phone-3', 'Pixel 8 Pro 128GB Bay Blue', 'Google', 'Smartphones', 999, 20, 'AI-powered camera and pure Android experience', '["https://images.unsplash.com/photo-1696602359489-09f485750d94?w=800", "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800", "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"]', '{"Display": "6.7 inch OLED", "RAM": "12GB", "Storage": "128GB", "Processor": "Google Tensor G3"}'),
('phone-4', 'Nothing Phone 2 Dark Grey', 'Nothing', 'Smartphones', 649, 25, 'Unique design with transparent back and quality build', '["https://images.unsplash.com/photo-1688649102473-099b9d16aa32?w=800", "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800", "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"]', '{"Display": "6.7 inch OLED", "RAM": "12GB", "Storage": "256GB", "Processor": "Snapdragon 8 Gen 2"}'),
('phone-5', 'OnePlus 12 Flowy Emerald', 'OnePlus', 'Smartphones', 799, 18, 'Fast charging and smooth performance', '["https://images.unsplash.com/photo-1711200383120-f1395c808f9c?w=800", "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800", "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800", "https://images.unsplash.com/photo-1698122410604-c85a1e6901e0?w=800"]', '{"Display": "6.82 inch AMOLED", "RAM": "12GB", "Storage": "256GB", "Processor": "Snapdragon 8 Gen 3 Leading"}'),
('phone-6', 'Galaxy Z Fold 5 Graphite', 'Samsung', 'Smartphones', 1799, 8, 'Innovative foldable design with premium features', '["https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=800", "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800", "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800", "https://images.unsplash.com/photo-1698122410604-c85a1e6901e0?w=800"]', '{"Display": "7.6 inch Dynamic AMOLED", "RAM": "12GB", "Storage": "512GB", "Processor": "Snapdragon 8 Gen 2"}'),
('phone-7', 'Xperia 1 V 4K OLED Phone', 'Sony', 'Smartphones', 1399, 6, 'Professional grade 4K recording and photography', '["https://images.unsplash.com/photo-1610945661006-4147ecba0660?w=800", "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800", "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"]', '{"Display": "6.5 inch 4K HDR", "RAM": "12GB", "Storage": "512GB", "Processor": "Snapdragon 8 Gen 2"}'),
('phone-8', 'iPhone 15 Plus Pink 128GB', 'Apple', 'Smartphones', 899, 22, 'Larger iPhone with great battery life', '["https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800", "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800", "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"]', '{"Display": "6.7 inch OLED", "RAM": "6GB", "Storage": "128GB", "Processor": "A16 Bionic"}'),
('phone-9', 'Pixel 7a Charcoal Compact', 'Google', 'Smartphones', 499, 30, 'Affordable flagship with excellent camera', '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800", "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800", "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800", "https://images.unsplash.com/photo-1698122410604-c85a1e6901e0?w=800"]', '{"Display": "6.1 inch OLED", "RAM": "8GB", "Storage": "128GB", "Processor": "Google Tensor"}'),
('phone-10', 'Motorola Razr+ Flip 2024', 'Motorola', 'Smartphones', 999, 14, 'Modern flip design with impressive features', '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800", "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800", "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800", "https://images.unsplash.com/photo-1698122410604-c85a1e6901e0?w=800"]', '{"Display": "6.9 inch AMOLED", "RAM": "12GB", "Storage": "256GB", "Processor": "Snapdragon 8 Gen 3"}');

-- 2. LAPTOPS (10 products)
INSERT INTO products (id, name, brand, category, price, stock, description, images, specs) VALUES
('laptop-1', 'MacBook Pro 14 M3 Max 36GB', 'Apple', 'Laptops', 3199, 10, 'Professional powerhouse with Apple Silicon', '["https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800", "https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800"]', '{"Processor": "M3 Max", "RAM": "36GB", "Storage": "1TB SSD", "Display": "14.2 inch Liquid Retina"}'),
('laptop-2', 'XPS 15 9530 i9 32GB 1TB', 'Dell', 'Laptops', 2199, 12, 'Windows powerhouse with stunning display', '["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800", "https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800", "https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800"]', '{"Processor": "Intel i9-13900H", "RAM": "32GB", "Storage": "1TB SSD", "Display": "15.6 inch OLED"}'),
('laptop-3', 'Spectre x360 14-inch OLED', 'HP', 'Laptops', 1499, 16, 'Convertible with premium build quality', '["https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?w=800", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800", "https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800"]', '{"Processor": "Intel Core i7", "RAM": "16GB", "Storage": "512GB SSD", "Display": "14 inch OLED"}'),
('laptop-4', 'ThinkPad X1 Carbon Gen 12', 'Lenovo', 'Laptops', 1899, 14, 'Business class ultrabook', '["https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800", "https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800"]', '{"Processor": "Intel Core i7", "RAM": "16GB", "Storage": "512GB SSD", "Display": "14 inch IPS"}'),
('laptop-5', 'Blade 16 RTX 4090 Gaming', 'Razer', 'Laptops', 4299, 5, 'Ultimate gaming machine', '["https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800", "https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800"]', '{"Processor": "Intel Core i9", "GPU": "RTX 4090", "RAM": "32GB", "Storage": "2TB SSD"}'),
('laptop-6', 'ROG Zephyrus G16 OLED 2024', 'Asus', 'Laptops', 2699, 9, 'High-performance gaming laptop', '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800", "https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800"]', '{"Processor": "Intel Core i9", "GPU": "RTX 4080", "RAM": "32GB", "Storage": "1TB SSD"}'),
('laptop-7', 'Surface Laptop 5 13.5-inch', 'Microsoft', 'Laptops', 1299, 18, 'Sleek and premium Windows ultrabook', '["https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800", "https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800"]', '{"Processor": "Intel Core i7", "RAM": "16GB", "Storage": "512GB SSD", "Display": "13.5 inch Touch"}'),
('laptop-8', 'MacBook Air 15 M3 Space Grey', 'Apple', 'Laptops', 1499, 20, 'Powerful yet portable Apple laptop', '["https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800", "https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800"]', '{"Processor": "M3", "RAM": "8GB", "Storage": "256GB SSD", "Display": "15.3 inch Liquid Retina"}'),
('laptop-9', 'MSI Raider GE78 HX Gaming', 'MSI', 'Laptops', 3599, 7, 'Extreme gaming performance laptop', '["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800", "https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800"]', '{"Processor": "Intel Core i9-13980HX", "GPU": "RTX 4080", "RAM": "32GB", "Storage": "1TB SSD"}'),
('laptop-10', 'Alienware m18 R2 Desktop Replacement', 'Dell', 'Laptops', 2899, 6, 'Desktop replacement gaming powerhouse', '["https://images.unsplash.com/photo-1580522154071-c6ca47a859ad?w=800", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800", "https://images.unsplash.com/photo-1517336714467-d23663d77291?w=800"]', '{"Processor": "Intel Core i9", "GPU": "RTX 4080", "RAM": "64GB", "Storage": "2TB SSD"}');

-- 3. TABLETS/ACCESSORIES (10 products)
INSERT INTO products (id, name, brand, category, price, stock, description, images, specs) VALUES
('tablet-1', 'iPad Pro 12.9 Liquid Retina XDR', 'Apple', 'Accessories', 1099, 13, 'Professional iPad with stunning display', '["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800", "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"]', '{"Display": "12.9 inch Liquid Retina XDR", "Processor": "M2", "Storage": "256GB", "RAM": "8GB"}'),
('tablet-2', 'Galaxy Tab S9+ Android Tablet', 'Samsung', 'Accessories', 999, 15, 'Premium Android tablet with S Pen', '["https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"]', '{"Display": "12.4 inch Dynamic AMOLED", "Processor": "Snapdragon 8 Gen 2", "RAM": "12GB", "Storage": "256GB"}'),
('tablet-3', 'iPad Air 10.9-inch Space Grey', 'Apple', 'Accessories', 599, 24, 'Balanced iPad for all users', '["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800"]', '{"Display": "10.9 inch Liquid Retina", "Processor": "M1", "Storage": "64GB", "RAM": "8GB"}'),
('tablet-4', 'Surface Pro 9 i7 16GB 256GB', 'Microsoft', 'Accessories', 1299, 11, 'Windows tablet with full PC experience', '["https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800"]', '{"Display": "13 inch PixelSense Touch", "Processor": "Intel Core i7", "RAM": "16GB", "Storage": "256GB"}'),
('tablet-5', 'Tab P12 Pro Entertainment Tablet', 'Lenovo', 'Accessories', 699, 19, 'Entertainment focused Android tablet', '["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800", "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"]', '{"Display": "12.7 inch AMOLED", "Processor": "MediaTek Kompanio", "RAM": "10GB", "Storage": "128GB"}'),
('tablet-6', 'Fire Max 11 Tablet 64GB', 'Amazon', 'Accessories', 229, 40, 'Budget-friendly tablet with great value', '["https://images.unsplash.com/photo-1583573636246-18cb2246697f?w=800", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800"]', '{"Display": "11 inch IPS", "Processor": "MediaTek Helio G99", "RAM": "4GB", "Storage": "64GB"}'),
('tablet-7', 'Pixel Tablet Hazel with Dock', 'Google', 'Accessories', 499, 21, 'Google tablets with Android Pure', '["https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"]', '{"Display": "11 inch LCD", "Processor": "Google Tensor", "RAM": "8GB", "Storage": "128GB"}'),
('tablet-8', 'Xiaomi Pad 6S Pro 12.4', 'Xiaomi', 'Accessories', 549, 17, 'Budget flagship tablet', '["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800"]', '{"Display": "12.4 inch OLED", "Processor": "Snapdragon 8+ Gen 1", "RAM": "12GB", "Storage": "512GB"}'),
('tablet-9', 'iPad Mini 6th Gen 64GB Purple', 'Apple', 'Accessories', 499, 26, 'Compact powerful iPad', '["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800"]', '{"Display": "8.3 inch Liquid Retina", "Processor": "A15 Bionic", "Storage": "64GB", "RAM": "4GB"}'),
('tablet-10', 'Galaxy Tab A9+ Budget Friendly', 'Samsung', 'Accessories', 219, 35, 'Affordable Samsung tablet', '["https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"]', '{"Display": "11 inch IPS", "Processor": "Helio G99", "RAM": "4GB", "Storage": "64GB"}');

-- 4. HEADPHONES (10 products)
INSERT INTO products (id, name, brand, category, price, stock, description, images, specs) VALUES
('headphones-1', 'WH-1000XM5 Noise Cancelling Silver', 'Sony', 'Headphones', 349, 28, 'Industry-leading noise cancellation', '["https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800", "https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800", "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800"]', '{"Type": "Over-Ear", "Driver": "30mm", "Frequency": "4Hz-40kHz", "Battery": "30h"}'),
('headphones-2', 'QuietComfort Ultra Over-Ear White', 'Bose', 'Headphones', 429, 16, 'Premium comfort and sound quality', '["https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800", "https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800", "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800"]', '{"Type": "Over-Ear", "Driver": "Custom", "Frequency": "20Hz-20kHz", "Battery": "24h"}'),
('headphones-3', 'AirPods Pro 2nd Gen USB-C ANC', 'Apple', 'Headphones', 249, 32, 'Apple adaptive audio technology', '["https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800", "https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800", "https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800"]', '{"Type": "Earbuds", "Driver": "Custom", "Frequency": "20Hz-20kHz", "Battery": "6h"}'),
('headphones-4', 'Momentum 4 Wireless Graphite Black', 'Sennheiser', 'Headphones', 379, 19, 'Premium Sennheiser sound', '["https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800", "https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800", "https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800"]', '{"Type": "Over-Ear", "Driver": "38mm", "Frequency": "10Hz-40kHz", "Battery": "60h"}'),
('headphones-5', 'Tour One M2 Professional Headphones', 'JBL', 'Headphones', 299, 23, 'Professional studio quality', '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800", "https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800", "https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800"]', '{"Type": "Over-Ear", "Driver": "40mm", "Frequency": "20Hz-20kHz", "Battery": "50h"}'),
('headphones-6', 'Major IV Wireless 80h Playtime', 'Marshall', 'Headphones', 149, 38, 'Iconic Marshall sound in wireless', '["https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800", "https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800", "https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800"]', '{"Type": "Over-Ear", "Driver": "40mm", "Frequency": "10Hz-20kHz", "Battery": "80h"}'),
('headphones-7', 'Beats Studio Pro Deep Navy', 'Beats', 'Headphones', 349, 21, 'Premium Beats technology', '["https://images.unsplash.com/photo-1545127398-14699f92334b?w=800", "https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800", "https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800"]', '{"Type": "Over-Ear", "Driver": "40mm", "Frequency": "20Hz-20kHz", "Battery": "40h"}'),
('headphones-8', 'WF-1000XM5 Premium Earbuds Black', 'Sony', 'Headphones', 299, 29, 'Sony earbuds with top-class ANC', '["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800", "https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800", "https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800"]', '{"Type": "Earbuds", "Driver": "8mm", "Frequency": "8Hz-40kHz", "Battery": "8h"}'),
('headphones-9', 'Nothing Ear Open Transparent Black', 'Nothing', 'Headphones', 199, 27, 'Open design earbuds with clarity', '["https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800", "https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800", "https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800"]', '{"Type": "Open Earbuds", "Driver": "12mm", "Frequency": "20Hz-20kHz", "Battery": "6h"}'),
('headphones-10', 'Samsung Galaxy Buds2 Pro Onyx', 'Samsung', 'Headphones', 229, 31, 'Samsung premium earbuds', '["https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800", "https://images.unsplash.com/photo-1618366712277-70ac3700078b?w=800", "https://images.unsplash.com/photo-1505740420928-5c5597c6d9a0?w=800"]', '{"Type": "Earbuds", "Driver": "5.4mm", "Frequency": "20Hz-20kHz", "Battery": "5h"}');

-- Verify the data
SELECT COUNT(*) as total_products FROM products;
SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category;
