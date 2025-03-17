-- Create cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policies for cart_items
CREATE POLICY "Users can view their own cart items"
  ON cart_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
  ON cart_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
  ON cart_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
  ON cart_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to get cart total
CREATE OR REPLACE FUNCTION get_cart_total(user_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total DECIMAL;
BEGIN
  SELECT COALESCE(SUM(p.price * ci.quantity), 0)
  INTO total
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
  WHERE ci.user_id = $1;
  
  RETURN total;
END;
$$;

-- Function to check stock availability
CREATE OR REPLACE FUNCTION check_stock_availability(product_id UUID, requested_quantity INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  available_stock INTEGER;
BEGIN
  SELECT stock_count INTO available_stock
  FROM products
  WHERE id = product_id;
  
  RETURN COALESCE(available_stock, 0) >= requested_quantity;
END;
$$;

-- Trigger to check stock before insert/update
CREATE OR REPLACE FUNCTION check_stock_before_cart_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT check_stock_availability(NEW.product_id, NEW.quantity) THEN
    RAISE EXCEPTION 'Insufficient stock available';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_stock_cart_insert
  BEFORE INSERT OR UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION check_stock_before_cart_change(); 