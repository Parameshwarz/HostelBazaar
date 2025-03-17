-- First, drop the foreign key constraint on item_id
ALTER TABLE request_matches
  DROP CONSTRAINT IF EXISTS request_matches_item_id_fkey;

-- Add item_details column
ALTER TABLE request_matches
  ADD COLUMN IF NOT EXISTS item_details JSONB;

-- Make item_id nullable since we're transitioning away from it
ALTER TABLE request_matches
  ALTER COLUMN item_id DROP NOT NULL;

-- Update the existing check constraint for status
ALTER TABLE request_matches
  DROP CONSTRAINT IF EXISTS request_matches_status_check,
  ADD CONSTRAINT request_matches_status_check 
  CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')); 