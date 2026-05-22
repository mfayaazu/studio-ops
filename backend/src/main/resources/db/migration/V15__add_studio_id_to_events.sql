-- Add nullable studio_id UUID column to event table first
ALTER TABLE event ADD COLUMN studio_id UUID;

-- Ensure the default studio exists
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
)
ON CONFLICT (id) DO NOTHING;

-- Update existing events with NULL studio_id to the default studio id
UPDATE event SET studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e' WHERE studio_id IS NULL;

-- Add foreign key constraint from event(studio_id) to studio(id)
ALTER TABLE event ADD CONSTRAINT fk_event_studio FOREIGN KEY (studio_id) REFERENCES studio(id);

-- After existing events are updated, make event.studio_id NOT NULL
ALTER TABLE event ALTER COLUMN studio_id SET NOT NULL;
