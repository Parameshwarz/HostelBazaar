-- Create service categories table
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_categories_updated_at
    BEFORE UPDATE ON service_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO service_categories (name, slug, description, icon) VALUES
    ('Programming & Development', 'programming', 'Software development, web development, and coding services', 'Code'),
    ('Design & Creative', 'design', 'Graphic design, UI/UX design, and creative services', 'Palette'),
    ('Engineering Projects', 'engineering', 'Engineering-related projects and technical services', 'Wrench'),
    ('Academic Support', 'academic', 'Tutoring, assignment help, and academic assistance', 'GraduationCap'),
    ('Data Analysis & Visualization', 'data-analysis', 'Data processing, analysis, visualization and insights', 'BarChart'),
    ('Electronics & PCB Design', 'electronics', 'Electronics projects, PCB design, and hardware services', 'Cpu'),
    ('Content Writing & Documentation', 'content-writing', 'Technical writing, documentation and content creation', 'PenTool'),
    ('Research Assistance', 'research', 'Research support, literature review, and methodology assistance', 'Search'),
    ('Mentorship & Skill Development', 'mentorship', 'One-on-one mentoring and skill development guidance', 'Users'),
    ('Miscellaneous Services', 'miscellaneous', 'Other specialized academic and technical services', 'Package')
ON CONFLICT (slug) DO NOTHING; 