-- Service Categories
CREATE TABLE service_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Services Table
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES auth.users(id),
  category_id UUID REFERENCES service_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  price_type TEXT NOT NULL CHECK (price_type IN ('fixed', 'hourly', 'project')),
  price DECIMAL(10,2),
  delivery_time TEXT,
  skills TEXT[],
  portfolio_links TEXT[],
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(2,1),
  total_reviews INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Service Reviews
CREATE TABLE service_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Service Orders
CREATE TABLE service_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  client_id UUID REFERENCES auth.users(id),
  provider_id UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  requirements TEXT,
  price DECIMAL(10,2),
  delivery_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Service Messages
CREATE TABLE service_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default service categories
INSERT INTO service_categories (name, slug, description, icon) VALUES
  ('Programming & Development', 'programming', 'Custom software development, web apps, and coding help', 'Code'),
  ('Design & Creative', 'design', 'UI/UX design, graphics, logos, and creative assets', 'Palette'),
  ('Engineering Projects', 'engineering', 'Help with engineering assignments and projects', 'Tool'),
  ('Academic Support', 'academic', 'Tutoring and academic guidance', 'GraduationCap'),
  ('Content Writing', 'writing', 'Technical writing, documentation, and reports', 'PenTool'),
  ('Data Analysis', 'data', 'Data processing, analysis, and visualization', 'BarChart'),
  ('3D Modeling & CAD', '3d-modeling', '3D design, CAD drawings, and modeling', 'Cube'),
  ('Electronics & PCB', 'electronics', 'Circuit design, PCB layout, and electronics help', 'Cpu'),
  ('Mobile App Development', 'mobile-apps', 'Android and iOS app development', 'Smartphone'),
  ('Research Assistance', 'research', 'Research paper help and literature reviews', 'Search');

-- Set up RLS policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Services are insertable by authenticated users"
  ON services FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Services are updatable by provider"
  ON services FOR UPDATE
  USING (auth.uid() = provider_id); 