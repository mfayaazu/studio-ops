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

-- Add nullable studio_id UUID column to backup_record table first
ALTER TABLE backup_record ADD COLUMN studio_id UUID;

-- Update existing backup records with NULL studio_id to the default studio id
UPDATE backup_record SET studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e' WHERE studio_id IS NULL;

-- Add foreign key constraint from backup_record(studio_id) to studio(id)
ALTER TABLE backup_record ADD CONSTRAINT fk_backup_record_studio FOREIGN KEY (studio_id) REFERENCES studio(id);

-- Make backup_record.studio_id NOT NULL
ALTER TABLE backup_record ALTER COLUMN studio_id SET NOT NULL;
