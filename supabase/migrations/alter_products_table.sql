-- Add a type field to products table
ALTER TABLE products 
ADD COLUMN type text NOT NULL DEFAULT 'regular';

-- Update existing merch products
UPDATE products 
SET type = 'merch' 
WHERE category IN ('clothing', 'accessories', 'stationery');

-- Update existing regular products
UPDATE products 
SET type = 'regular' 
WHERE type = 'regular'; 