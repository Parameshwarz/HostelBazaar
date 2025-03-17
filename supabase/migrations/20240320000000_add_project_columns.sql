-- Add thumbnail_url and attachments columns to project_requests table
ALTER TABLE project_requests
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS attachments TEXT[]; 