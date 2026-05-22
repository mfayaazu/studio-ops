-- Add nullable studio_id UUID column to users table first
ALTER TABLE users ADD COLUMN studio_id UUID;

-- Insert a default development studio
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
);

-- Update existing users with NULL studio_id to the default studio id
UPDATE users SET studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e' WHERE studio_id IS NULL;

-- Add foreign key constraint from users(studio_id) to studio(id)
ALTER TABLE users ADD CONSTRAINT fk_users_studio FOREIGN KEY (studio_id) REFERENCES studio(id);

-- After existing users are updated, make users.studio_id NOT NULL
ALTER TABLE users ALTER COLUMN studio_id SET NOT NULL;
