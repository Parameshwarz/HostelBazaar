-- Create function to check stock availability
CREATE OR REPLACE FUNCTION check_stock_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  available_stock INTEGER;
BEGIN
  -- Get available stock
  SELECT stock_count INTO available_stock
  FROM products
  WHERE id = NEW.product_id;

  -- Check if enough stock is available
  IF available_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Not enough stock available. Only % items left.', available_stock;
  END IF;

  -- If this is an update, add back the old quantity to check against total
  IF TG_OP = 'UPDATE' THEN
    available_stock := available_stock + OLD.quantity;
  END IF;

  -- Check again with total quantity
  IF available_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Not enough stock available. Only % items left.', available_stock;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for stock check
DROP TRIGGER IF EXISTS check_stock_before_cart_change ON cart_items;
CREATE TRIGGER check_stock_before_cart_change
  BEFORE INSERT OR UPDATE
  ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION check_stock_availability(); 