-- Create user search history table
CREATE TABLE IF NOT EXISTS user_search_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, query)
);

-- Create popular searches table
CREATE TABLE IF NOT EXISTS popular_searches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query TEXT NOT NULL UNIQUE,
  count INTEGER DEFAULT 1,
  last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product views table
CREATE TABLE IF NOT EXISTS product_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add view_count column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create function to increment search count
CREATE OR REPLACE FUNCTION increment_search_count(search_query TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO popular_searches (query, count, last_searched_at)
  VALUES (search_query, 1, NOW())
  ON CONFLICT (query)
  DO UPDATE SET
    count = popular_searches.count + 1,
    last_searched_at = NOW();
END;
$$;

-- Create function to increment product views
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET view_count = view_count + 1
  WHERE id = product_id;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_created_at ON user_search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_popular_searches_count ON popular_searches(count DESC);
CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at);

-- Add RLS policies
ALTER TABLE user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- Policy for user_search_history
CREATE POLICY "Users can view their own search history"
  ON user_search_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
  ON user_search_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
  ON user_search_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for popular_searches
CREATE POLICY "Everyone can view popular searches"
  ON popular_searches
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for product_views
CREATE POLICY "Users can view their own product views"
  ON product_views
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product views"
  ON product_views
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id); 