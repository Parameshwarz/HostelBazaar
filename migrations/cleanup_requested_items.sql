-- Drop unused columns from requested_items table
ALTER TABLE requested_items
  DROP COLUMN IF EXISTS needed_by,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS course_code,
  DROP COLUMN IF EXISTS semester,
  DROP COLUMN IF EXISTS boost_coefficient,
  DROP COLUMN IF EXISTS preferences;

-- Add or modify columns we actually use
ALTER TABLE requested_items
  ADD COLUMN IF NOT EXISTS title text NOT NULL,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS min_budget integer,
  ADD COLUMN IF NOT EXISTS max_budget integer,
  ADD COLUMN IF NOT EXISTS urgency text CHECK (urgency IN ('low', 'medium', 'high')) DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('open', 'matched', 'fulfilled', 'closed')) DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS matches_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create a view for requests with user profiles
DROP VIEW IF EXISTS request_details;
CREATE VIEW request_details AS
SELECT 
  r.*,
  p.username,
  p.avatar_url,
  c.name as category_name,
  c.slug as category_slug
FROM requested_items r
LEFT JOIN auth.users u ON r.user_id = u.id
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN categories c ON r.category_id = c.id;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_requested_items_user_id ON requested_items(user_id);
CREATE INDEX IF NOT EXISTS idx_requested_items_category_id ON requested_items(category_id);
CREATE INDEX IF NOT EXISTS idx_requested_items_status ON requested_items(status);
CREATE INDEX IF NOT EXISTS idx_requested_items_urgency ON requested_items(urgency);

-- Enable RLS
ALTER TABLE requested_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view requests" ON requested_items;
DROP POLICY IF EXISTS "Users can create their own requests" ON requested_items;
DROP POLICY IF EXISTS "Users can update their own requests" ON requested_items;
DROP POLICY IF EXISTS "Users can delete their own requests" ON requested_items;

-- Create policies
CREATE POLICY "Anyone can view requests"
  ON requested_items FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own requests"
  ON requested_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests"
  ON requested_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own requests"
  ON requested_items FOR DELETE
  USING (auth.uid() = user_id); 