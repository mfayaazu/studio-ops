-- Add nullable studio_id UUID column to employee table first
ALTER TABLE employee ADD COLUMN studio_id UUID;

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

-- Update existing employees with NULL studio_id to the default studio id
UPDATE employee SET studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e' WHERE studio_id IS NULL;

-- Add foreign key constraint from employee(studio_id) to studio(id)
ALTER TABLE employee ADD CONSTRAINT fk_employee_studio FOREIGN KEY (studio_id) REFERENCES studio(id);

-- After existing employees are updated, make employee.studio_id NOT NULL
ALTER TABLE employee ALTER COLUMN studio_id SET NOT NULL;
