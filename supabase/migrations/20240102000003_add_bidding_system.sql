-- Create service requirements table
CREATE TABLE service_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget_range TEXT NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    skills_required TEXT[] DEFAULT '{}',
    client_id UUID REFERENCES profiles(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create service bids table
CREATE TABLE service_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID REFERENCES service_requirements(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES profiles(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    delivery_time TEXT NOT NULL,
    proposal TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(requirement_id, provider_id)
);

-- Enable RLS
ALTER TABLE service_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bids ENABLE ROW LEVEL SECURITY;

-- Create policies for service requirements
CREATE POLICY "Service requirements are viewable by everyone"
    ON service_requirements FOR SELECT
    USING (true);

CREATE POLICY "Service requirements are insertable by authenticated users"
    ON service_requirements FOR INSERT
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Service requirements are updatable by the client"
    ON service_requirements FOR UPDATE
    USING (auth.uid() = client_id);

-- Create policies for service bids
CREATE POLICY "Service bids are viewable by requirement participants"
    ON service_bids FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM service_requirements
            WHERE service_requirements.id = requirement_id
            AND (service_requirements.client_id = auth.uid() OR provider_id = auth.uid())
        )
    );

CREATE POLICY "Service bids are insertable by authenticated users except the client"
    ON service_bids FOR INSERT
    WITH CHECK (
        auth.uid() = provider_id AND
        auth.uid() != (
            SELECT client_id FROM service_requirements
            WHERE service_requirements.id = requirement_id
        )
    );

CREATE POLICY "Service bids are updatable by the provider"
    ON service_bids FOR UPDATE
    USING (auth.uid() = provider_id);

-- Create indexes for better performance
CREATE INDEX idx_service_requirements_client_id ON service_requirements(client_id);
CREATE INDEX idx_service_requirements_status ON service_requirements(status);
CREATE INDEX idx_service_bids_requirement_id ON service_bids(requirement_id);
CREATE INDEX idx_service_bids_provider_id ON service_bids(provider_id);

-- Add triggers for updated_at columns
CREATE TRIGGER set_service_requirements_updated_at
    BEFORE UPDATE ON service_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_service_bids_updated_at
    BEFORE UPDATE ON service_bids
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 