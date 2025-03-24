-- Create main notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  category text CHECK (category IN ('trade', 'message', 'alert', 'system')) NOT NULL,
  is_read boolean DEFAULT false,
  action_url text,
  related_id uuid,
  related_type text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can mark their notifications as read" ON notifications;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can mark their own notifications as read" ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    -- Only allow updating is_read field
    (auth.uid() = user_id) AND
    (OLD.title = NEW.title) AND
    (OLD.message = NEW.message) AND
    (OLD.category = NEW.category) AND
    (OLD.user_id = NEW.user_id) AND
    (OLD.action_url IS NOT DISTINCT FROM NEW.action_url) AND
    (OLD.related_id IS NOT DISTINCT FROM NEW.related_id) AND
    (OLD.related_type IS NOT DISTINCT FROM NEW.related_type)
  );

-- Create notification functions for different events
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new message is created, notify the recipient
  INSERT INTO notifications (
    user_id,
    title,
    message,
    category,
    related_id,
    related_type,
    action_url
  )
  VALUES (
    NEW.recipient_id,
    'New Message',
    'You have received a new message',
    'message',
    NEW.id,
    'message',
    '/messages'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_trade_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the owner of the item
  DECLARE
    item_owner_id uuid;
  BEGIN
    SELECT user_id INTO item_owner_id FROM items WHERE id = NEW.item_id;
    
    -- When a new trade offer is created, notify the item owner
    INSERT INTO notifications (
      user_id,
      title,
      message,
      category,
      related_id,
      related_type,
      action_url
    )
    VALUES (
      item_owner_id,
      'New Trade Offer',
      'Someone is interested in your item',
      'trade',
      NEW.id,
      'trade',
      '/trade/offers'
    );
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
-- Uncomment these when the messages and trades tables are available
-- CREATE TRIGGER create_message_notification_trigger
--   AFTER INSERT ON messages
--   FOR EACH ROW
--   EXECUTE FUNCTION create_message_notification();

-- CREATE TRIGGER create_trade_notification_trigger
--   AFTER INSERT ON trade_offers
--   FOR EACH ROW
--   EXECUTE FUNCTION create_trade_notification(); 