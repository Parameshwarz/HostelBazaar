-- Insert test users first (if they don't exist)
INSERT INTO auth.users (id, email)
VALUES 
  ('d0d8d9e2-0e13-4d06-9d56-9c1c9a90d624', 'seller1@test.com'),
  ('b5d2d9c1-1e23-4d16-8d46-8c2c8b91d523', 'seller2@test.com')
ON CONFLICT (id) DO NOTHING;

-- Insert test products
INSERT INTO products (
  id, 
  seller_id,
  title,
  description,
  price,
  category,
  stock_quantity,
  is_active,
  type
) VALUES 
  -- Clothing Items
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'd0d8d9e2-0e13-4d06-9d56-9c1c9a90d624',
    'College Logo Hoodie',
    'Comfortable cotton-blend hoodie with embroidered college logo. Available in multiple sizes.',
    1499.99,
    'clothing',
    50,
    true,
    'merch'
  ),
  (
    'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
    'd0d8d9e2-0e13-4d06-9d56-9c1c9a90d624',
    'Varsity T-Shirt',
    'Classic varsity t-shirt with printed college name. 100% cotton.',
    599.99,
    'clothing',
    100,
    true,
    'merch'
  ),
  (
    'c3d4e5f6-a7b8-6543-8765-3c4d5e6f7a8b',
    'b5d2d9c1-1e23-4d16-8d46-8c2c8b91d523',
    'Department Sweatshirt',
    'Department-specific sweatshirt with custom design. Perfect for winter.',
    999.99,
    'clothing',
    30,
    true,
    'merch'
  ),

  -- Accessories
  (
    'd4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c',
    'd0d8d9e2-0e13-4d06-9d56-9c1c9a90d624',
    'College Backpack',
    'Durable backpack with college logo and multiple compartments.',
    1299.99,
    'accessories',
    40,
    true,
    'merch'
  ),
  (
    'e5f6a7b8-c9d0-8765-8765-5e6f7a8b9c0d',
    'b5d2d9c1-1e23-4d16-8d46-8c2c8b91d523',
    'Student ID Card Holder',
    'Premium leather ID card holder with college emblem.',
    299.99,
    'accessories',
    200,
    true,
    'merch'
  ),

  -- Stationery
  (
    'f6a7b8c9-d0e1-9876-8765-6f7a8b9c0d1e',
    'd0d8d9e2-0e13-4d06-9d56-9c1c9a90d624',
    'Notebook Set',
    'Set of 5 premium notebooks with college branding.',
    399.99,
    'stationery',
    150,
    true,
    'merch'
  ),
  (
    'a7b8c9d0-e1f2-0987-8765-7a8b9c0d1e2f',
    'b5d2d9c1-1e23-4d16-8d46-8c2c8b91d523',
    'Custom Pen Set',
    'Elegant pen set with college name engraving.',
    249.99,
    'stationery',
    100,
    true,
    'merch'
  );

-- Insert product images
INSERT INTO product_images (
  product_id,
  image_url,
  is_primary
) VALUES 
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800',
    true
  ),
  (
    'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800',
    true
  ),
  (
    'c3d4e5f6-a7b8-6543-8765-3c4d5e6f7a8b',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800',
    true
  ),
  (
    'd4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800',
    true
  ),
  (
    'e5f6a7b8-c9d0-8765-8765-5e6f7a8b9c0d',
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800',
    true
  ),
  (
    'f6a7b8c9-d0e1-9876-8765-6f7a8b9c0d1e',
    'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800',
    true
  ),
  (
    'a7b8c9d0-e1f2-0987-8765-7a8b9c0d1e2f',
    'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=800',
    true
  );

-- Insert some product reviews
INSERT INTO product_reviews (
  product_id,
  user_id,
  rating,
  comment
) VALUES 
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'd0d8d9e2-0e13-4d06-9d56-9c1c9a90d624',
    5,
    'Great quality hoodie! Very comfortable.'
  ),
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'b5d2d9c1-1e23-4d16-8d46-8c2c8b91d523',
    4,
    'Nice design but slightly expensive.'
  ),
  (
    'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
    'd0d8d9e2-0e13-4d06-9d56-9c1c9a90d624',
    5,
    'Perfect fit and great material!'
  );

-- Insert product variants
INSERT INTO product_variants (
  product_id,
  size,
  color,
  stock_quantity,
  price_adjustment
) VALUES 
  -- Hoodie variants
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'S',
    'Navy Blue',
    10,
    0
  ),
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'M',
    'Navy Blue',
    20,
    0
  ),
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'L',
    'Navy Blue',
    15,
    0
  ),
  -- T-shirt variants
  (
    'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
    'S',
    'White',
    25,
    0
  ),
  (
    'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
    'M',
    'White',
    30,
    0
  ),
  (
    'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
    'L',
    'White',
    25,
    0
  ); 

-- Update product images with more relevant images
UPDATE product_images
SET image_url = CASE product_id
  -- College Logo Hoodie
  WHEN 'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f' THEN 
    'https://images.unsplash.com/photo-1572495064914-47a9b62cf86b?auto=format&fit=crop&w=800&q=80'
  
  -- Varsity T-Shirt
  WHEN 'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a' THEN 
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80'
  
  -- Department Sweatshirt
  WHEN 'c3d4e5f6-a7b8-6543-8765-3c4d5e6f7a8b' THEN 
    'https://images.unsplash.com/photo-1611187401884-83a941aa0266?auto=format&fit=crop&w=800&q=80'
  
  -- College Backpack
  WHEN 'd4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c' THEN 
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
  
  -- Student ID Card Holder
  WHEN 'e5f6a7b8-c9d0-8765-8765-5e6f7a8b9c0d' THEN 
    'https://images.unsplash.com/photo-1627134173563-3f0f2c3f3c0c?auto=format&fit=crop&w=800&q=80'
  
  -- Notebook Set
  WHEN 'f6a7b8c9-d0e1-9876-8765-6f7a8b9c0d1e' THEN 
    'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80'
  
  -- Custom Pen Set
  WHEN 'a7b8c9d0-e1f2-0987-8765-7a8b9c0d1e2f' THEN 
    'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=800&q=80'
END
WHERE is_primary = true;

-- Add secondary images for some products
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
  -- Additional Hoodie Images
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    false
  ),
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
    false
  ),
  
  -- Additional T-Shirt Images
  (
    'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    false
  ),
  (
    'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    false
  ),
  
  -- Additional Backpack Images
  (
    'd4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c',
    'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&w=800&q=80',
    false
  ),
  (
    'd4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c',
    'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80',
    false
  ),

  -- Additional Notebook Images
  (
    'f6a7b8c9-d0e1-9876-8765-6f7a8b9c0d1e',
    'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    false
  ),
  (
    'f6a7b8c9-d0e1-9876-8765-6f7a8b9c0d1e',
    'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80',
    false
  );

-- Add some variations in colors for the clothing items
INSERT INTO product_variants (product_id, size, color, stock_quantity, price_adjustment) VALUES
  -- More Hoodie variants
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'M',
    'Maroon',
    15,
    0
  ),
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'L',
    'Maroon',
    10,
    0
  ),
  (
    'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
    'M',
    'Gray',
    20,
    0
  ),
  
  -- More T-shirt variants
  (
    'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
    'S',
    'Black',
    25,
    0
  ),
  (
    'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
    'M',
    'Black',
    30,
    0
  ),
  (
    'b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
    'L',
    'Navy',
    20,
    0
  ); 