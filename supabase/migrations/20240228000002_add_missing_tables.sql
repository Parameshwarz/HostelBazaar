-- Create user_search_history table
CREATE TABLE IF NOT EXISTS user_search_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create popular_searches table
CREATE TABLE IF NOT EXISTS popular_searches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query TEXT NOT NULL UNIQUE,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create product_views table
CREATE TABLE IF NOT EXISTS product_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Create function to increment search count
CREATE OR REPLACE FUNCTION increment_search_count(search_query TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO popular_searches (query, count)
  VALUES (search_query, 1)
  ON CONFLICT (query)
  DO UPDATE SET 
    count = popular_searches.count + 1,
    updated_at = timezone('utc'::text, now());
END;
$$;

-- Create function to increment product views
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID, user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO product_views (product_id, user_id)
  VALUES (product_id, user_id)
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET 
    viewed_at = timezone('utc'::text, now());
    
  UPDATE products
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = product_id;
END;
$$;

-- Enable RLS
ALTER TABLE user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own search history" ON user_search_history;
DROP POLICY IF EXISTS "Users can insert their own search history" ON user_search_history;
DROP POLICY IF EXISTS "Everyone can view popular searches" ON popular_searches;
DROP POLICY IF EXISTS "Users can view their own product views" ON product_views;
DROP POLICY IF EXISTS "Users can insert their own product views" ON product_views;
DROP POLICY IF EXISTS "Users can update their own product views" ON product_views;

-- Create policies
CREATE POLICY "Users can view their own search history"
ON user_search_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
ON user_search_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view popular searches"
ON popular_searches FOR SELECT
USING (true);

CREATE POLICY "Users can view their own product views"
ON product_views FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product views"
ON product_views FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product views"
ON product_views FOR UPDATE
USING (auth.uid() = user_id);

-- Add new columns to products table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'department') THEN
    ALTER TABLE products ADD COLUMN department TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
    ALTER TABLE products ADD COLUMN tags TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_on_sale') THEN
    ALTER TABLE products ADD COLUMN is_on_sale BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sale_price') THEN
    ALTER TABLE products ADD COLUMN sale_price DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'rating') THEN
    ALTER TABLE products ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'rating_count') THEN
    ALTER TABLE products ADD COLUMN rating_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'colors') THEN
    ALTER TABLE products ADD COLUMN colors TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sizes') THEN
    ALTER TABLE products ADD COLUMN sizes TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'view_count') THEN
    ALTER TABLE products ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
    ALTER TABLE products ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_products_department ON products USING GIN (department);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_products_colors ON products USING GIN (colors);
CREATE INDEX IF NOT EXISTS idx_products_sizes ON products USING GIN (sizes);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products (rating);
CREATE INDEX IF NOT EXISTS idx_products_view_count ON products (view_count);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at);
CREATE INDEX IF NOT EXISTS idx_products_is_on_sale ON products (is_on_sale);

-- Create function to check if a product is new (within last 30 days)
CREATE OR REPLACE FUNCTION is_new_arrival(created_at TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN created_at >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql; 