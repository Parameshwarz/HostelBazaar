-- Create trust_scores table
CREATE TABLE trust_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    overall_score DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    delivery_speed_score DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    communication_score DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    quality_score DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    revision_responsiveness DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    total_completed_orders INTEGER NOT NULL DEFAULT 0,
    on_time_delivery_rate DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    repeat_client_rate DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    avg_response_time INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_preferences table for AI matchmaker
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_categories UUID[] DEFAULT ARRAY[]::UUID[],
    preferred_price_range INT4RANGE,
    preferred_delivery_time INTERVAL,
    preferred_experience_levels TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_languages TEXT[] DEFAULT ARRAY[]::TEXT[],
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create service_compatibility table for AI matchmaker
CREATE TABLE service_compatibility (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    compatibility_score DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    match_reasons JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(service_id, user_id)
);

-- Create user_behavior_logs table for AI matchmaker
CREATE TABLE user_behavior_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_details JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add trust score related columns to services table
ALTER TABLE services
ADD COLUMN trust_score_id UUID REFERENCES trust_scores(id),
ADD COLUMN ai_summary JSONB DEFAULT '{}'::JSONB;

-- Create function to update trust scores
CREATE OR REPLACE FUNCTION update_trust_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate new scores based on various factors
    WITH provider_stats AS (
        SELECT 
            provider_id,
            AVG(CASE WHEN rating IS NOT NULL THEN rating ELSE 0 END) as avg_rating,
            COUNT(*) as total_orders,
            COUNT(CASE WHEN status = 'completed' AND delivered_on_time THEN 1 END)::DECIMAL / 
                NULLIF(COUNT(CASE WHEN status = 'completed' THEN 1 END), 0) * 100 as on_time_rate,
            COUNT(DISTINCT client_id)::DECIMAL / NULLIF(COUNT(*), 0) * 100 as repeat_client_rate,
            AVG(EXTRACT(EPOCH FROM (first_response_time - created_at)))::INTERVAL as avg_response_time
        FROM orders
        WHERE provider_id = NEW.provider_id
        GROUP BY provider_id
    )
    UPDATE trust_scores
    SET 
        overall_score = (
            delivery_speed_score + 
            communication_score + 
            quality_score + 
            revision_responsiveness
        ) / 4,
        total_completed_orders = (SELECT total_orders FROM provider_stats),
        on_time_delivery_rate = (SELECT on_time_rate FROM provider_stats),
        repeat_client_rate = (SELECT repeat_client_rate FROM provider_stats),
        avg_response_time = (SELECT avg_response_time FROM provider_stats),
        updated_at = NOW()
    WHERE provider_id = NEW.provider_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for trust score updates
CREATE TRIGGER update_trust_score_trigger
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_trust_score();

-- Create function to update service compatibility scores
CREATE OR REPLACE FUNCTION update_service_compatibility()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate compatibility scores based on user preferences and service attributes
    INSERT INTO service_compatibility (service_id, user_id, compatibility_score, match_reasons)
    SELECT 
        NEW.id as service_id,
        up.user_id,
        (
            CASE 
                WHEN s.category_id = ANY(up.preferred_categories) THEN 30
                ELSE 0
            END +
            CASE 
                WHEN s.starting_price <@ up.preferred_price_range THEN 25
                ELSE 0
            END +
            CASE 
                WHEN s.experience_level = ANY(up.preferred_experience_levels) THEN 25
                ELSE 0
            END +
            CASE 
                WHEN array_length(array_intersect(s.skills, up.interests), 1) > 0 THEN 20
                ELSE 0
            END
        )::DECIMAL(3,1) as compatibility_score,
        jsonb_build_array(
            CASE 
                WHEN s.category_id = ANY(up.preferred_categories) 
                THEN jsonb_build_object('type', 'category_match', 'weight', 30)
                ELSE NULL
            END,
            CASE 
                WHEN s.starting_price <@ up.preferred_price_range 
                THEN jsonb_build_object('type', 'price_match', 'weight', 25)
                ELSE NULL
            END,
            CASE 
                WHEN s.experience_level = ANY(up.preferred_experience_levels) 
                THEN jsonb_build_object('type', 'experience_match', 'weight', 25)
                ELSE NULL
            END,
            CASE 
                WHEN array_length(array_intersect(s.skills, up.interests), 1) > 0 
                THEN jsonb_build_object('type', 'skills_match', 'weight', 20)
                ELSE NULL
            END
        ) - jsonb_build_array(NULL) as match_reasons
    FROM user_preferences up
    CROSS JOIN services s
    WHERE s.id = NEW.id
    ON CONFLICT (service_id, user_id) 
    DO UPDATE SET 
        compatibility_score = EXCLUDED.compatibility_score,
        match_reasons = EXCLUDED.match_reasons,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for service compatibility updates
CREATE TRIGGER update_service_compatibility_trigger
AFTER INSERT OR UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_service_compatibility();

-- Create indexes for better query performance
CREATE INDEX idx_trust_scores_provider_id ON trust_scores(provider_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_service_compatibility_user_id ON service_compatibility(user_id);
CREATE INDEX idx_service_compatibility_score ON service_compatibility(compatibility_score DESC);
CREATE INDEX idx_user_behavior_logs_user_id ON user_behavior_logs(user_id);
CREATE INDEX idx_user_behavior_logs_service_id ON user_behavior_logs(service_id);
