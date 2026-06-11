-- V42__add_lead_id_to_follow_up_task.sql
-- Add lead_id column to follow_up_task referencing lead table

ALTER TABLE follow_up_task ADD COLUMN lead_id UUID;
ALTER TABLE follow_up_task ADD CONSTRAINT fk_follow_up_task_lead FOREIGN KEY (lead_id) REFERENCES "lead"(id) ON DELETE SET NULL;
CREATE INDEX idx_follow_up_task_studio_lead ON follow_up_task(studio_id, lead_id);
