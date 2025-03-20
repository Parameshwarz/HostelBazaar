-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all items" ON items;
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;

-- Create new policies
CREATE POLICY "Users can view all items"
ON items FOR SELECT
USING (true);

-- Simplified insert policy with just authentication check
CREATE POLICY "Users can insert their own items"
ON items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own items"
ON items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
ON items FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY; 