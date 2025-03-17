-- Add foreign key constraint to services table
ALTER TABLE services
ADD CONSTRAINT fk_service_category
FOREIGN KEY (category_id)
REFERENCES service_categories(id)
ON DELETE SET NULL; 