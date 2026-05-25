-- V24__create_leads.sql
-- Create lead table and corresponding indexes

CREATE TABLE lead (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    client_id UUID,
    project_id UUID,
    client_name VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    preferred_channel VARCHAR(50) NOT NULL,
    event_type VARCHAR(100),
    event_date DATE,
    city VARCHAR(100),
    estimated_value NUMERIC(12,2),
    lead_source VARCHAR(50) NOT NULL,
    pipeline_stage VARCHAR(50) NOT NULL,
    assigned_user_id UUID,
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    next_follow_up_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    lost_reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_lead_studio FOREIGN KEY (studio_id) REFERENCES studio(id) ON DELETE CASCADE,
    CONSTRAINT fk_lead_client FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE SET NULL,
    CONSTRAINT fk_lead_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE SET NULL,
    CONSTRAINT fk_lead_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_lead_studio_pipeline_stage ON lead(studio_id, pipeline_stage);
CREATE INDEX idx_lead_studio_lead_source ON lead(studio_id, lead_source);
CREATE INDEX idx_lead_studio_next_follow_up ON lead(studio_id, next_follow_up_at);
CREATE INDEX idx_lead_studio_event_date ON lead(studio_id, event_date);
CREATE INDEX idx_lead_studio_client_name ON lead(studio_id, client_name);
