ALTER TABLE deliverable ADD COLUMN priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE deliverable ADD COLUMN assigned_employee_id UUID NULL;

ALTER TABLE deliverable ADD CONSTRAINT fk_deliverable_assigned_employee FOREIGN KEY (assigned_employee_id) REFERENCES employee(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_deliverable_studio_priority ON deliverable(studio_id, priority);
CREATE INDEX IF NOT EXISTS idx_deliverable_studio_assigned_employee ON deliverable(studio_id, assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_deliverable_studio_due_date ON deliverable(studio_id, due_date);
