-- Add listing_type column to items table
ALTER TABLE items 
ADD COLUMN listing_type text NOT NULL DEFAULT 'item' 
CHECK (listing_type IN ('item', 'request'));

-- Update existing rows to have 'item' as listing_type
UPDATE items SET listing_type = 'item' WHERE listing_type IS NULL;

-- Add index for better query performance
CREATE INDEX idx_items_listing_type ON items(listing_type);

-- Update RLS policies to include listing_type
DROP POLICY IF EXISTS "Users can view all items" ON items;
CREATE POLICY "Users can view all items" ON items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own items" ON items;
CREATE POLICY "Users can insert their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own items" ON items;
CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own items" ON items;
CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id); 