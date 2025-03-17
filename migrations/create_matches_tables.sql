-- Create request_matches table
CREATE TABLE request_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES requested_items(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create request_notifications table
CREATE TABLE request_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES request_matches(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('new_match', 'match_accepted', 'match_rejected', 'match_completed')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_request_matches_request_id ON request_matches(request_id);
CREATE INDEX idx_request_matches_item_id ON request_matches(item_id);
CREATE INDEX idx_request_matches_user_id ON request_matches(user_id);
CREATE INDEX idx_request_matches_status ON request_matches(status);
CREATE INDEX idx_request_notifications_user_id ON request_notifications(user_id);
CREATE INDEX idx_request_notifications_match_id ON request_notifications(match_id);
CREATE INDEX idx_request_notifications_is_read ON request_notifications(is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE request_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for request_matches
CREATE POLICY "Users can view their own matches" ON request_matches
    FOR SELECT
    USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT user_id FROM requested_items WHERE id = request_matches.request_id
        )
    );

CREATE POLICY "Users can create matches" ON request_matches
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches" ON request_matches
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for request_notifications
CREATE POLICY "Users can view their own notifications" ON request_notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON request_notifications
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON request_notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to automatically create notifications
CREATE OR REPLACE FUNCTION create_match_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the user_id of the request owner
    INSERT INTO request_notifications (
        user_id,
        match_id,
        type,
        created_at,
        updated_at
    )
    SELECT 
        requested_items.user_id,
        NEW.id,
        CASE
            WHEN NEW.status = 'pending' THEN 'new_match'
            WHEN NEW.status = 'accepted' THEN 'match_accepted'
            WHEN NEW.status = 'rejected' THEN 'match_rejected'
            WHEN NEW.status = 'completed' THEN 'match_completed'
        END,
        NOW(),
        NOW()
    FROM requested_items
    WHERE requested_items.id = NEW.request_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for match notifications
CREATE TRIGGER create_match_notification_trigger
    AFTER INSERT OR UPDATE OF status
    ON request_matches
    FOR EACH ROW
    EXECUTE FUNCTION create_match_notification(); 