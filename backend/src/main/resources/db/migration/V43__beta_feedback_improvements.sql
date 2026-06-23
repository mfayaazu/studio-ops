-- V43__beta_feedback_improvements.sql
-- Add CRM, project, employee, and deliverable enhancements

-- 1. Add short_code to studio
ALTER TABLE studio ADD COLUMN short_code VARCHAR(50);

-- 2. Add project fields
ALTER TABLE project ADD COLUMN project_subtype VARCHAR(255);
ALTER TABLE project ADD COLUMN project_events VARCHAR(1000);
ALTER TABLE project ADD COLUMN project_budget DECIMAL(12,2);
ALTER TABLE project ADD COLUMN amount_paid DECIMAL(12,2);
ALTER TABLE project ADD COLUMN shoot_location VARCHAR(500);
ALTER TABLE project ADD COLUMN google_maps_link VARCHAR(1000);
ALTER TABLE project ADD COLUMN shoot_date DATE;
ALTER TABLE project ADD COLUMN shoot_start_time TIME;
ALTER TABLE project ADD COLUMN shoot_end_time TIME;
ALTER TABLE project ADD COLUMN priority VARCHAR(50) DEFAULT 'MEDIUM';
ALTER TABLE project ADD COLUMN lead_source VARCHAR(255);

-- 3. Add employee leave fields
ALTER TABLE employee ADD COLUMN leave_from_date DATE;
ALTER TABLE employee ADD COLUMN leave_to_date DATE;

-- 4. Add deliverable custom type field
ALTER TABLE deliverable ADD COLUMN custom_deliverable_type VARCHAR(255);

-- 5. Drop the existing global unique constraint on project_code and add studio-scoped unique constraint
ALTER TABLE project DROP CONSTRAINT IF EXISTS project_project_code_key;
ALTER TABLE project ADD CONSTRAINT uq_project_studio_code UNIQUE (studio_id, project_code);
