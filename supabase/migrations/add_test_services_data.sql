-- Get random existing users for services
WITH random_users AS (
  SELECT id FROM auth.users ORDER BY RANDOM() LIMIT 2
)

-- Insert test services
INSERT INTO services (
  provider_id,
  category_id,
  title,
  description,
  short_description,
  price_type,
  price,
  delivery_time,
  skills,
  portfolio_links,
  is_active,
  rating,
  total_reviews
) 
SELECT
  (SELECT id FROM random_users ORDER BY RANDOM() LIMIT 1) as provider_id,
  sc.id as category_id,
  title,
  description,
  short_description,
  price_type,
  price,
  delivery_time,
  skills,
  portfolio_links,
  true as is_active,
  ROUND((RANDOM() * 2 + 3)::numeric, 1) as rating,
  (RANDOM() * 50 + 10)::INT as total_reviews
FROM (
  VALUES
    -- Programming & Development
    ('Full Stack Web Application Development', 
     'Professional web application development using React, Node.js, and modern cloud technologies. Includes responsive design, API integration, and database setup.',
     'Custom web apps with modern tech stack',
     'project', 15000, '10-14 days',
     ARRAY['React', 'Node.js', 'TypeScript', 'AWS'],
     ARRAY['https://github.com/portfolio1', 'https://example.com/project1'],
     'programming'),
     
    -- Design & Creative
    ('UI/UX Design for Web and Mobile', 
     'Professional UI/UX design services for web and mobile applications. Modern, user-friendly interfaces with complete design systems.',
     'Modern UI/UX design solutions',
     'project', 12000, '7-10 days',
     ARRAY['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
     ARRAY['https://dribbble.com/portfolio1'],
     'design'),

    -- Engineering Projects
    ('Engineering Design and Analysis', 
     'Professional engineering design services including CAD modeling, structural analysis, and technical documentation.',
     'Comprehensive engineering solutions',
     'project', 18000, '14-21 days',
     ARRAY['AutoCAD', 'SolidWorks', 'MATLAB', 'FEA'],
     ARRAY['https://example.com/engineering-portfolio'],
     'engineering'),

    -- Academic Support
    ('Advanced Mathematics and Physics Tutoring', 
     'Expert tutoring in advanced mathematics and physics. Covering university level topics with practical problem-solving approach.',
     'Expert math and physics tutoring',
     'hourly', 800, 'Flexible',
     ARRAY['Calculus', 'Physics', 'Linear Algebra', 'Differential Equations'],
     ARRAY['https://example.com/tutor-profile'],
     'academic'),

    -- Data Analysis & Visualization
    ('Data Analytics and Business Intelligence', 
     'Comprehensive data analysis services including statistical analysis, data visualization, and actionable insights generation.',
     'Professional data analytics services',
     'project', 10000, '7-10 days',
     ARRAY['Python', 'R', 'Tableau', 'Power BI', 'SQL'],
     ARRAY['https://github.com/data-portfolio'],
     'data-analysis'),

    -- Electronics & PCB Design
    ('PCB Design and Prototyping', 
     'Professional PCB design services including schematic capture, PCB layout, and manufacturing support.',
     'Expert PCB design services',
     'project', 8000, '10-14 days',
     ARRAY['Altium Designer', 'KiCad', 'Eagle', 'Circuit Design'],
     ARRAY['https://example.com/pcb-portfolio'],
     'electronics'),

    -- Content Writing & Documentation
    ('Technical Documentation and API Guides', 
     'Professional technical writing services for software documentation, API guides, and user manuals.',
     'Expert technical documentation',
     'project', 5000, '5-7 days',
     ARRAY['Technical Writing', 'API Documentation', 'User Guides', 'Markdown'],
     ARRAY['https://example.com/writing-samples'],
     'content-writing'),

    -- Research Assistance
    ('Research Methodology and Analysis', 
     'Professional research assistance including methodology design, data collection, and analysis for academic papers.',
     'Comprehensive research support',
     'project', 7000, '10-14 days',
     ARRAY['Research Methods', 'Statistical Analysis', 'Literature Review', 'SPSS'],
     ARRAY['https://example.com/research-portfolio'],
     'research'),

    -- Mentorship & Skill Development
    ('Software Development Career Mentoring', 
     'One-on-one mentorship for aspiring software developers. Career guidance, skill development, and project portfolio building.',
     'Professional career mentoring',
     'hourly', 1000, 'Flexible',
     ARRAY['Career Planning', 'Skill Development', 'Portfolio Building', 'Interview Prep'],
     ARRAY['https://example.com/mentor-profile'],
     'mentorship'),

    -- Miscellaneous Services
    ('Custom Academic and Technical Solutions', 
     'Specialized services for unique academic and technical requirements. Customized solutions based on specific needs.',
     'Customized academic solutions',
     'project', 6000, '7-10 days',
     ARRAY['Custom Solutions', 'Technical Support', 'Academic Tools', 'Consulting'],
     ARRAY['https://example.com/portfolio'],
     'miscellaneous')
) as services(title, description, short_description, price_type, price, delivery_time, skills, portfolio_links, category_slug)
JOIN service_categories sc ON sc.slug = services.category_slug;

-- Add some reviews for each service using random existing users
INSERT INTO service_reviews (service_id, reviewer_id, rating, comment)
SELECT 
  s.id,
  (SELECT id FROM auth.users ORDER BY RANDOM() LIMIT 1),
  (RANDOM() * 2 + 3)::INT,
  CASE (RANDOM() * 3)::INT
    WHEN 0 THEN 'Excellent service! Very professional and delivered on time.'
    WHEN 1 THEN 'Great work! Exactly what I needed.'
    ELSE 'Very knowledgeable and helpful. Would recommend!'
  END
FROM services s
CROSS JOIN generate_series(1, 5); 