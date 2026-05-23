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

-- Add nullable studio_id UUID column to deliverable table first
ALTER TABLE deliverable ADD COLUMN studio_id UUID;

-- Update existing deliverables with NULL studio_id to the default studio id
UPDATE deliverable SET studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e' WHERE studio_id IS NULL;

-- Add foreign key constraint from deliverable(studio_id) to studio(id)
ALTER TABLE deliverable ADD CONSTRAINT fk_deliverable_studio FOREIGN KEY (studio_id) REFERENCES studio(id);

-- Make deliverable.studio_id NOT NULL
ALTER TABLE deliverable ALTER COLUMN studio_id SET NOT NULL;
