-- Create service portfolio table
CREATE TABLE service_portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'before_after')),
    content JSONB NOT NULL,
    timeline JSONB,
    testimonial JSONB,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE service_portfolio ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service portfolio items are viewable by everyone"
    ON service_portfolio FOR SELECT
    USING (true);

CREATE POLICY "Service portfolio items are insertable by service provider"
    ON service_portfolio FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM services
            WHERE services.id = service_id
            AND services.provider_id = auth.uid()
        )
    );

CREATE POLICY "Service portfolio items are updatable by service provider"
    ON service_portfolio FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM services
            WHERE services.id = service_id
            AND services.provider_id = auth.uid()
        )
    );

CREATE POLICY "Service portfolio items are deletable by service provider"
    ON service_portfolio FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM services
            WHERE services.id = service_id
            AND services.provider_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX idx_service_portfolio_service_id ON service_portfolio(service_id);
CREATE INDEX idx_service_portfolio_type ON service_portfolio(type);

-- Add trigger for updated_at
CREATE TRIGGER set_service_portfolio_updated_at
    BEFORE UPDATE ON service_portfolio
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 