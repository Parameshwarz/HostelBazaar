-- Create project requests table
CREATE TABLE project_requests (
  id bigint primary key generated always as identity,
  client_id uuid references profiles(id) not null,
  category_id bigint references service_categories(id) not null,
  title text not null,
  description text not null,
  budget_min integer not null check (budget_min >= 0),
  budget_max integer not null check (budget_max >= budget_min),
  deadline timestamp with time zone not null,
  required_skills text[] not null default '{}',
  experience_level text not null,
  status text not null default 'open',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create project proposals table
CREATE TABLE project_proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES project_requests(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES auth.users(id),
  price DECIMAL(10,2) NOT NULL,
  delivery_time TEXT NOT NULL,
  cover_letter TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE project_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_proposals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all project requests"
  ON project_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own project requests"
  ON project_requests FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can update their own project requests"
  ON project_requests FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid());

-- RLS Policies for project proposals
CREATE POLICY "Project proposals are viewable by project client or provider"
  ON project_proposals FOR SELECT
  USING (
    auth.uid() IN (
      SELECT pr.client_id 
      FROM project_requests pr 
      WHERE pr.id = project_id
    ) 
    OR auth.uid() = provider_id
  );

CREATE POLICY "Project proposals are insertable by providers"
  ON project_proposals FOR INSERT
  WITH CHECK (
    auth.uid() = provider_id 
    AND NOT EXISTS (
      SELECT 1 
      FROM project_proposals pp 
      WHERE pp.project_id = project_id 
      AND pp.provider_id = auth.uid()
    )
  );

CREATE POLICY "Project proposals are updatable by provider"
  ON project_proposals FOR UPDATE
  USING (auth.uid() = provider_id);

-- Add indexes
CREATE INDEX project_requests_client_id_idx ON project_requests(client_id);
CREATE INDEX project_requests_category_id_idx ON project_requests(category_id);
CREATE INDEX project_requests_status_idx ON project_requests(status);
CREATE INDEX project_requests_created_at_idx ON project_requests(created_at desc);

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON project_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at(); 