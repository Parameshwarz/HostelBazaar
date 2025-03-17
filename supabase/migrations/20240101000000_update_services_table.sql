-- Add new columns to services table
ALTER TABLE services
  ADD COLUMN experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'expert')),
  ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Create service levels table
CREATE TABLE service_levels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  name TEXT CHECK (name IN ('basic', 'standard', 'premium')),
  price DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  delivery_time TEXT NOT NULL,
  revisions INTEGER NOT NULL DEFAULT 1,
  features TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Rename price to starting_price for clarity
ALTER TABLE services 
  RENAME COLUMN price TO starting_price;

-- Insert some test categories
INSERT INTO service_categories (name, slug, description, icon) VALUES
  ('Programming & Development', 'programming', 'Software development, web apps, and coding services', 'Code'),
  ('Design & Creative', 'design', 'UI/UX design, graphics, and creative services', 'Palette'),
  ('Engineering Projects', 'engineering', 'Engineering solutions and technical projects', 'Tool'),
  ('Academic Support', 'academic', 'Academic assistance and tutoring services', 'GraduationCap'),
  ('Content Writing', 'writing', 'Content creation and writing services', 'PenTool'),
  ('Data Analysis', 'data', 'Data analysis and visualization services', 'BarChart');

-- Insert test services
WITH test_user AS (
  SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1
)
INSERT INTO services (
  provider_id,
  category_id,
  title,
  description,
  short_description,
  price_type,
  starting_price,
  delivery_time,
  skills,
  portfolio_links,
  is_active,
  is_featured,
  experience_level,
  rating,
  total_reviews,
  total_orders
) 
SELECT 
  (SELECT id FROM test_user),
  sc.id,
  'Full Stack Web Development',
  'Professional web application development using React, Node.js, and modern cloud technologies. Includes responsive design, API integration, and database setup.',
  'Custom web apps with modern tech stack',
  'project',
  15000,
  '14 days',
  ARRAY['React', 'Node.js', 'TypeScript', 'AWS'],
  ARRAY['https://github.com/portfolio1', 'https://example.com/project1'],
  true,
  true,
  'expert',
  4.8,
  12,
  25
FROM service_categories sc
WHERE sc.slug = 'programming'
RETURNING id, provider_id;

-- Insert service levels for the test service
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
  name,
  price,
  description,
  delivery_time,
  revisions,
  features
FROM (SELECT id FROM services ORDER BY created_at DESC LIMIT 1) s
CROSS JOIN (
  VALUES
    (
      'basic',
      15000,
      'Basic package with essential features',
      '14 days',
      1,
      ARRAY['Source code', 'Basic documentation', 'Responsive design']
    ),
    (
      'standard',
      25000,
      'Standard package with additional features',
      '10 days',
      2,
      ARRAY['Source code', 'Detailed documentation', 'Responsive design', 'API integration', 'Database setup']
    ),
    (
      'premium',
      40000,
      'Premium package with all features',
      '7 days',
      3,
      ARRAY['Source code', 'Comprehensive documentation', 'Responsive design', 'API integration', 'Database setup', 'Performance optimization', 'Security audit']
    )
) AS levels(name, price, description, delivery_time, revisions, features); 