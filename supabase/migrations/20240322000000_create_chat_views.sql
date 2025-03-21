-- Create a view for chat details with participant information
CREATE OR REPLACE VIEW chat_details AS
SELECT 
  c.id,
  c.participant_1,
  c.participant_2,
  c.item_id,
  c.last_message,
  c.last_message_at,
  c.created_at,
  c.updated_at,
  c.status,
  c.is_pinned,
  c.meeting_scheduled,
  c.location_agreed,
  c.deal_completed,
  c.is_blocked,
  c.is_muted,
  p1.username as participant_1_username,
  p1.avatar_url as participant_1_avatar,
  p1.last_seen as participant_1_last_seen,
  p1.trust_score as participant_1_trust_score,
  p2.username as participant_2_username,
  p2.avatar_url as participant_2_avatar,
  p2.last_seen as participant_2_last_seen,
  p2.trust_score as participant_2_trust_score
FROM chats c
JOIN profiles p1 ON c.participant_1 = p1.id
JOIN profiles p2 ON c.participant_2 = p2.id;

-- Enable RLS on the view
ALTER VIEW chat_details SET ROW LEVEL SECURITY;

-- Create policy to allow users to view their own chats
CREATE POLICY "Users can view their own chats"
  ON chat_details FOR SELECT
  USING (
    participant_1 = auth.uid() OR 
    participant_2 = auth.uid()
  ); 