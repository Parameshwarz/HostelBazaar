-- Create service_wishlist table
CREATE TABLE service_wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, service_id)
);

-- Create service_images table
CREATE TABLE service_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create service_features table
CREATE TABLE service_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE service_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_features ENABLE ROW LEVEL SECURITY;

-- Create policies for service_wishlist
CREATE POLICY "Users can view their own wishlist"
  ON service_wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist"
  ON service_wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist"
  ON service_wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for service_images
CREATE POLICY "Service images are viewable by everyone"
  ON service_images FOR SELECT
  USING (true);

CREATE POLICY "Service images are manageable by service provider"
  ON service_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_id
      AND services.provider_id = auth.uid()
    )
  );

-- Create policies for service_features
CREATE POLICY "Service features are viewable by everyone"
  ON service_features FOR SELECT
  USING (true);

CREATE POLICY "Service features are manageable by service provider"
  ON service_features FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_id
      AND services.provider_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_service_wishlist_user ON service_wishlist(user_id);
CREATE INDEX idx_service_wishlist_service ON service_wishlist(service_id);
CREATE INDEX idx_service_images_service ON service_images(service_id);
CREATE INDEX idx_service_features_service ON service_features(service_id);

-- Add foreign key for reviewer in service_reviews
ALTER TABLE service_reviews
ADD COLUMN reviewer_profile_id UUID REFERENCES profiles(id);

-- Update existing reviews to link to profiles
UPDATE service_reviews
SET reviewer_profile_id = (
  SELECT id FROM profiles WHERE profiles.id = reviewer_id
); 