-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Product images are viewable by everyone" ON product_images;
DROP POLICY IF EXISTS "Product images are insertable by authenticated users" ON product_images;

-- Create new policies
CREATE POLICY "Product images are viewable by everyone"
ON product_images FOR SELECT
USING (true);

CREATE POLICY "Product images are insertable by anyone"
ON product_images FOR INSERT
WITH CHECK (true);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY; 