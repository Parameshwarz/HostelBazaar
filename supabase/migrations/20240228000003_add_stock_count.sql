-- Add stock_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stock_count') 
  THEN
    ALTER TABLE products ADD COLUMN stock_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Update stock_count from stock_quantity for existing products
UPDATE products 
SET stock_count = stock_quantity 
WHERE stock_count IS NULL; 