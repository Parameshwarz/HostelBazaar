-- First drop the dependent view
DROP VIEW IF EXISTS items_with_users;

-- Remove hostel-related columns
ALTER TABLE items 
DROP COLUMN IF EXISTS hostel_name,
DROP COLUMN IF EXISTS room_number;

-- Add item_type column
ALTER TABLE items 
ADD COLUMN item_type text NOT NULL DEFAULT 'sell'
CHECK (item_type IN ('sell', 'rent', 'donate')); 