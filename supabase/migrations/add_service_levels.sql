-- Add service levels for each service
INSERT INTO service_levels (
  service_id,
  name,
  price,
  description,
  delivery_time,
  revisions,
  features
)
SELECT 
  s.id,
  level_name,
  CASE 
    WHEN level_name = 'basic' THEN s.starting_price
    WHEN level_name = 'standard' THEN s.starting_price * 1.5
    ELSE s.starting_price * 2
  END,
  CASE
    WHEN level_name = 'basic' THEN 'Basic package with essential features'
    WHEN level_name = 'standard' THEN 'Standard package with additional features'
    ELSE 'Premium package with all features included'
  END,
  CASE
    WHEN level_name = 'basic' THEN s.delivery_time
    WHEN level_name = 'standard' THEN 
      CASE 
        WHEN s.delivery_time = 'Flexible' THEN 'Flexible'
        ELSE REGEXP_REPLACE(s.delivery_time, '(\d+)', '\1')::text || ' days'
      END
    ELSE 
      CASE 
        WHEN s.delivery_time = 'Flexible' THEN 'Flexible'
        ELSE REGEXP_REPLACE(s.delivery_time, '(\d+)', '\1')::text || ' days'
      END
  END,
  CASE
    WHEN level_name = 'basic' THEN 1
    WHEN level_name = 'standard' THEN 2
    ELSE 3
  END,
  CASE
    WHEN level_name = 'basic' THEN ARRAY['Basic feature 1', 'Basic feature 2']
    WHEN level_name = 'standard' THEN ARRAY['All basic features', 'Standard feature 1', 'Standard feature 2']
    ELSE ARRAY['All basic and standard features', 'Premium feature 1', 'Premium feature 2', 'Priority support']
  END
FROM services s
CROSS JOIN (
  VALUES 
    ('basic'),
    ('standard'),
    ('premium')
) AS levels(level_name); 