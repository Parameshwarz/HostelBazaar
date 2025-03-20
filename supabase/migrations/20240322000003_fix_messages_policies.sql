-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- Create new policies
CREATE POLICY "Users can view their own messages"
ON messages FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id OR
  auth.uid() IN (
    SELECT participant_1 FROM chats WHERE id = chat_id
    UNION
    SELECT participant_2 FROM chats WHERE id = chat_id
  )
);

CREATE POLICY "Users can insert their own messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
ON messages FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY; 