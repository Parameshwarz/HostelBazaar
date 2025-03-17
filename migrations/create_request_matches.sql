-- Create request_matches table
CREATE TABLE IF NOT EXISTS request_matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid REFERENCES requested_items(id) ON DELETE CASCADE,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  status text CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create notifications table for request matches
CREATE TABLE IF NOT EXISTS request_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id uuid REFERENCES request_matches(id) ON DELETE CASCADE,
  type text CHECK (type IN ('new_match', 'match_accepted', 'match_rejected', 'match_completed')),
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_request_matches_request_id ON request_matches(request_id);
CREATE INDEX IF NOT EXISTS idx_request_matches_item_id ON request_matches(item_id);
CREATE INDEX IF NOT EXISTS idx_request_matches_user_id ON request_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_request_matches_status ON request_matches(status);
CREATE INDEX IF NOT EXISTS idx_request_notifications_user_id ON request_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_request_notifications_match_id ON request_notifications(match_id);
CREATE INDEX IF NOT EXISTS idx_request_notifications_is_read ON request_notifications(is_read);

-- Enable RLS
ALTER TABLE request_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own matches" ON request_matches;
DROP POLICY IF EXISTS "Request owners can view matches for their requests" ON request_matches;
DROP POLICY IF EXISTS "Users can create matches" ON request_matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON request_matches;
DROP POLICY IF EXISTS "Request owners can update match status" ON request_matches;
DROP POLICY IF EXISTS "Users can view their own notifications" ON request_notifications;
DROP POLICY IF EXISTS "System can create notifications" ON request_notifications;
DROP POLICY IF EXISTS "Users can mark their notifications as read" ON request_notifications;

-- Create policies for request_matches
CREATE POLICY "Users can view their own matches"
  ON request_matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Request owners can view matches for their requests"
  ON request_matches FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM requested_items WHERE id = request_id
    )
  );

CREATE POLICY "Users can create matches"
  ON request_matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
  ON request_matches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Request owners can update match status"
  ON request_matches FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM requested_items WHERE id = request_id
    )
  );

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON request_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON request_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can mark their notifications as read"
  ON request_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to increment a value
CREATE OR REPLACE FUNCTION increment(x integer)
RETURNS integer AS $$
  SELECT x + 1;
$$ LANGUAGE SQL IMMUTABLE;

-- Create function to automatically create notification when match is created
CREATE OR REPLACE FUNCTION create_match_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for request owner
  INSERT INTO request_notifications (
    user_id,
    match_id,
    type
  )
  SELECT 
    ri.user_id,
    NEW.id,
    'new_match'
  FROM requested_items ri
  WHERE ri.id = NEW.request_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new match notifications
CREATE TRIGGER create_match_notification_trigger
AFTER INSERT ON request_matches
FOR EACH ROW
EXECUTE FUNCTION create_match_notification(); 