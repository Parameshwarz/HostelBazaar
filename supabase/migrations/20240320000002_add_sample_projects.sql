-- Add sample projects
INSERT INTO project_requests (
  id,
  title,
  description,
  status,
  budget_min,
  budget_max,
  deadline,
  required_skills,
  experience_level,
  category_id,
  client_id,
  created_at,
  updated_at,
  thumbnail_url,
  attachments
) VALUES
-- Web Development Projects
(
  'proj_01',
  'E-commerce Website with Advanced Features',
  'Looking for an experienced developer to build a modern e-commerce platform. Features include: product management, cart functionality, payment integration (Stripe), user authentication, admin dashboard, and analytics. Mobile responsive design is crucial.',
  'open',
  2000,
  5000,
  '2024-05-01',
  ARRAY['React', 'Node.js', 'PostgreSQL', 'Stripe API', 'Redux', 'TypeScript'],
  'expert',
  (SELECT id FROM service_categories WHERE name = 'Web Development'),
  (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1),
  NOW(),
  NOW(),
  'https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=1964&auto=format&fit=crop',
  ARRAY['https://example.com/mockup1.jpg', 'https://example.com/specs.pdf']
),
(
  'proj_02',
  'Educational Platform Development',
  'Need to develop an online learning platform with video streaming, course management, quiz system, and progress tracking. Should include both student and instructor interfaces.',
  'open',
  3000,
  7000,
  '2024-06-15',
  ARRAY['Vue.js', 'Django', 'WebRTC', 'AWS', 'Docker'],
  'intermediate',
  (SELECT id FROM service_categories WHERE name = 'Web Development'),
  (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1),
  NOW(),
  NOW(),
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1974&auto=format&fit=crop',
  ARRAY['https://example.com/platform-wireframes.pdf']
),

-- Mobile App Development
(
  'proj_03',
  'Fitness Tracking Mobile App',
  'Seeking a mobile developer to create a comprehensive fitness tracking app. Features: workout planning, progress tracking, social sharing, nutrition logging, and integration with wearable devices.',
  'open',
  4000,
  8000,
  '2024-05-30',
  ARRAY['React Native', 'Firebase', 'HealthKit', 'Google Fit API'],
  'expert',
  (SELECT id FROM service_categories WHERE name = 'Mobile Development'),
  (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1),
  NOW(),
  NOW(),
  'https://images.unsplash.com/photo-1461773518188-b3e86f98242f?q=80&w=2069&auto=format&fit=crop',
  ARRAY['https://example.com/app-mockups.fig']
),

-- UI/UX Design
(
  'proj_04',
  'SaaS Dashboard UI/UX Design',
  'Looking for a UI/UX designer to create a modern, intuitive dashboard for our SaaS platform. Need complete design system, user flows, and high-fidelity prototypes.',
  'open',
  1500,
  3500,
  '2024-04-15',
  ARRAY['Figma', 'UI Design', 'UX Research', 'Design Systems', 'Prototyping'],
  'intermediate',
  (SELECT id FROM service_categories WHERE name = 'UI/UX Design'),
  (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1),
  NOW(),
  NOW(),
  'https://images.unsplash.com/photo-1545235617-7a424c1a60cc?q=80&w=1780&auto=format&fit=crop',
  ARRAY['https://example.com/current-dashboard.pdf']
),

-- AI/ML Projects
(
  'proj_05',
  'AI-Powered Content Recommendation System',
  'Need to develop a machine learning-based content recommendation system. Should analyze user behavior, content metadata, and engagement patterns to provide personalized recommendations.',
  'open',
  5000,
  12000,
  '2024-07-01',
  ARRAY['Python', 'TensorFlow', 'NLP', 'Recommendation Systems', 'AWS'],
  'expert',
  (SELECT id FROM service_categories WHERE name = 'AI Development'),
  (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1),
  NOW(),
  NOW(),
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1932&auto=format&fit=crop',
  ARRAY['https://example.com/system-architecture.pdf']
),

-- Digital Marketing
(
  'proj_06',
  'Social Media Marketing Campaign',
  'Seeking a digital marketing expert for a 3-month social media campaign. Need content strategy, creative assets, paid advertising management, and performance analytics.',
  'open',
  2000,
  4000,
  '2024-04-30',
  ARRAY['Social Media Marketing', 'Content Strategy', 'Paid Advertising', 'Analytics'],
  'intermediate',
  (SELECT id FROM service_categories WHERE name = 'Digital Marketing'),
  (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1),
  NOW(),
  NOW(),
  'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c2b2?q=80&w=1974&auto=format&fit=crop',
  ARRAY['https://example.com/brand-guidelines.pdf']
),

-- Blockchain Development
(
  'proj_07',
  'NFT Marketplace Development',
  'Looking for a blockchain developer to create an NFT marketplace. Features: NFT minting, buying/selling, auctions, wallet integration, and smart contracts.',
  'open',
  6000,
  15000,
  '2024-06-30',
  ARRAY['Solidity', 'Web3.js', 'React', 'Smart Contracts', 'IPFS'],
  'expert',
  (SELECT id FROM service_categories WHERE name = 'Blockchain'),
  (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1),
  NOW(),
  NOW(),
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2032&auto=format&fit=crop',
  ARRAY['https://example.com/marketplace-specs.pdf']
),

-- Game Development
(
  'proj_08',
  '2D Mobile Game Development',
  'Need a game developer to create a casual 2D mobile game. Includes character design, level creation, monetization features, and social elements.',
  'open',
  3000,
  8000,
  '2024-05-15',
  ARRAY['Unity', 'C#', 'Game Design', '2D Animation', 'Mobile Gaming'],
  'intermediate',
  (SELECT id FROM service_categories WHERE name = 'Game Development'),
  (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1),
  NOW(),
  NOW(),
  'https://images.unsplash.com/photo-1556438064-2d7646166914?q=80&w=2070&auto=format&fit=crop',
  ARRAY['https://example.com/game-concept.pdf']
),

-- Data Science
(
  'proj_09',
  'Customer Segmentation Analysis',
  'Seeking a data scientist for customer segmentation analysis. Need to analyze customer data, create segments, and provide actionable insights for marketing strategies.',
  'open',
  2500,
  6000,
  '2024-04-30',
  ARRAY['Python', 'R', 'Machine Learning', 'Data Visualization', 'Statistical Analysis'],
  'intermediate',
  (SELECT id FROM service_categories WHERE name = 'Data Science'),
  (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1),
  NOW(),
  NOW(),
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
  ARRAY['https://example.com/data-requirements.pdf']
),

-- DevOps
(
  'proj_10',
  'CI/CD Pipeline Implementation',
  'Need a DevOps engineer to set up automated CI/CD pipelines. Include testing, deployment automation, monitoring, and infrastructure as code.',
  'open',
  4000,
  9000,
  '2024-05-30',
  ARRAY['Jenkins', 'Docker', 'Kubernetes', 'AWS', 'Terraform'],
  'expert',
  (SELECT id FROM service_categories WHERE name = 'DevOps'),
  (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1),
  NOW(),
  NOW(),
  'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=2070&auto=format&fit=crop',
  ARRAY['https://example.com/infrastructure-docs.pdf']
);

-- Add some sample proposals for each project
INSERT INTO project_proposals (
  project_id,
  provider_id,
  proposal_text,
  price,
  delivery_time,
  status,
  created_at,
  updated_at
)
SELECT
  pr.id,
  (SELECT id FROM profiles WHERE id != pr.client_id ORDER BY RANDOM() LIMIT 1),
  'I am very interested in working on this project. I have extensive experience in similar projects and can deliver high-quality results within the specified timeframe.',
  (pr.budget_min + pr.budget_max) / 2,
  '30 days',
  'pending',
  NOW(),
  NOW()
FROM project_requests pr;

-- Add a few more proposals to some projects
INSERT INTO project_proposals (
  project_id,
  provider_id,
  proposal_text,
  price,
  delivery_time,
  status,
  created_at,
  updated_at
)
SELECT
  id,
  (SELECT id FROM profiles WHERE id != client_id ORDER BY RANDOM() LIMIT 1),
  'I would love to work on this project. My expertise perfectly matches your requirements, and I can start immediately.',
  budget_max,
  '25 days',
  'pending',
  NOW(),
  NOW()
FROM project_requests
WHERE id IN ('proj_01', 'proj_03', 'proj_05', 'proj_07'); 