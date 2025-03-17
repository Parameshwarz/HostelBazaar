-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    service_level TEXT NOT NULL CHECK (service_level IN ('basic', 'standard', 'premium')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    price DECIMAL(10,2) NOT NULL,
    requirements TEXT,
    delivery_date TIMESTAMP WITH TIME ZONE,
    delivered_on_time BOOLEAN DEFAULT false,
    first_response_time TIMESTAMP WITH TIME ZONE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Orders are viewable by client or provider"
    ON orders FOR SELECT
    USING (auth.uid() = client_id OR auth.uid() = provider_id);

CREATE POLICY "Orders are insertable by authenticated users as clients"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Orders are updatable by client or provider"
    ON orders FOR UPDATE
    USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_provider_id ON orders(provider_id);
CREATE INDEX idx_orders_service_id ON orders(service_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Create function to update service order count
CREATE OR REPLACE FUNCTION update_service_order_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE services
        SET total_orders = total_orders + 1
        WHERE id = NEW.service_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE services
        SET total_orders = total_orders - 1
        WHERE id = OLD.service_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating service order count
CREATE TRIGGER update_service_order_count_trigger
    AFTER INSERT OR DELETE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_service_order_count();

-- Create function to update service rating
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE services
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(3,1)
            FROM orders
            WHERE service_id = NEW.service_id
            AND rating IS NOT NULL
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM orders
            WHERE service_id = NEW.service_id
            AND rating IS NOT NULL
        )
    WHERE id = NEW.service_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating service rating
CREATE TRIGGER update_service_rating_trigger
    AFTER INSERT OR UPDATE OF rating ON orders
    FOR EACH ROW
    WHEN (NEW.rating IS NOT NULL)
    EXECUTE FUNCTION update_service_rating(); 