-- Create order milestones table
CREATE TABLE order_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order deliverables table
CREATE TABLE order_deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    uploaded_by UUID REFERENCES profiles(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order revisions table
CREATE TABLE order_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES profiles(id),
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    response_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order messages table
CREATE TABLE order_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order payments table
CREATE TABLE order_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES order_milestones(id),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'refunded')),
    payment_method TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE order_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for order milestones
CREATE POLICY "Order milestones are viewable by order participants"
    ON order_milestones FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND (orders.client_id = auth.uid() OR orders.provider_id = auth.uid())
        )
    );

CREATE POLICY "Order milestones are insertable by provider"
    ON order_milestones FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND orders.provider_id = auth.uid()
        )
    );

CREATE POLICY "Order milestones are updatable by provider"
    ON order_milestones FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND orders.provider_id = auth.uid()
        )
    );

-- Create RLS policies for order deliverables
CREATE POLICY "Order deliverables are viewable by order participants"
    ON order_deliverables FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND (orders.client_id = auth.uid() OR orders.provider_id = auth.uid())
        )
    );

CREATE POLICY "Order deliverables are insertable by provider"
    ON order_deliverables FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND orders.provider_id = auth.uid()
        )
    );

-- Create RLS policies for order revisions
CREATE POLICY "Order revisions are viewable by order participants"
    ON order_revisions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND (orders.client_id = auth.uid() OR orders.provider_id = auth.uid())
        )
    );

CREATE POLICY "Order revisions are insertable by client"
    ON order_revisions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND orders.client_id = auth.uid()
        )
    );

CREATE POLICY "Order revisions are updatable by provider"
    ON order_revisions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND orders.provider_id = auth.uid()
        )
    );

-- Create RLS policies for order messages
CREATE POLICY "Order messages are viewable by order participants"
    ON order_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND (orders.client_id = auth.uid() OR orders.provider_id = auth.uid())
        )
    );

CREATE POLICY "Order messages are insertable by order participants"
    ON order_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND (orders.client_id = auth.uid() OR orders.provider_id = auth.uid())
        )
    );

-- Create RLS policies for order payments
CREATE POLICY "Order payments are viewable by order participants"
    ON order_payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND (orders.client_id = auth.uid() OR orders.provider_id = auth.uid())
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_order_milestones_order_id ON order_milestones(order_id);
CREATE INDEX idx_order_deliverables_order_id ON order_deliverables(order_id);
CREATE INDEX idx_order_revisions_order_id ON order_revisions(order_id);
CREATE INDEX idx_order_messages_order_id ON order_messages(order_id);
CREATE INDEX idx_order_payments_order_id ON order_payments(order_id);
CREATE INDEX idx_order_payments_milestone_id ON order_payments(milestone_id);

-- Add triggers for updated_at columns
CREATE TRIGGER set_order_milestones_updated_at
    BEFORE UPDATE ON order_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_order_revisions_updated_at
    BEFORE UPDATE ON order_revisions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 