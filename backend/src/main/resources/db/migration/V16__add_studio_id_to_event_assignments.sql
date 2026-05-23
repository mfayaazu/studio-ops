-- Insert default studio if it does not already exist
INSERT INTO studio (id, name, slug, business_email, country, timezone, status, subscription_plan, subscription_status, created_at, updated_at)
VALUES (
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'Default Studio',
    'default-studio',
    'owner@studioops.local',
    'Sweden',
    'Europe/Stockholm',
    'ACTIVE',
    'STARTER',
    'TRIAL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Add nullable studio_id UUID column to event_assignment table first
ALTER TABLE event_assignment ADD COLUMN studio_id UUID;

-- Update existing assignments with NULL studio_id to the default studio id
UPDATE event_assignment SET studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e' WHERE studio_id IS NULL;

-- Add foreign key constraint from event_assignment(studio_id) to studio(id)
ALTER TABLE event_assignment ADD CONSTRAINT fk_event_assignment_studio FOREIGN KEY (studio_id) REFERENCES studio(id);

-- Make event_assignment.studio_id NOT NULL
ALTER TABLE event_assignment ALTER COLUMN studio_id SET NOT NULL;
