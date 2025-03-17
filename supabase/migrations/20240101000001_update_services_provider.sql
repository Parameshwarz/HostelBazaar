-- First drop the existing foreign key
ALTER TABLE services DROP CONSTRAINT services_provider_id_fkey;

-- Add the new foreign key to profiles
ALTER TABLE services
  ADD CONSTRAINT services_provider_id_fkey
  FOREIGN KEY (provider_id)
  REFERENCES profiles(id); 