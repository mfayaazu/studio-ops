CREATE TABLE post_production_task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    project_id UUID NOT NULL,
    deliverable_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    assigned_employee_id UUID,
    due_date DATE,
    estimated_hours NUMERIC(6,2),
    actual_hours NUMERIC(6,2),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_ppt_studio FOREIGN KEY (studio_id) REFERENCES studio(id),
    CONSTRAINT fk_ppt_project FOREIGN KEY (project_id) REFERENCES project(id),
    CONSTRAINT fk_ppt_deliverable FOREIGN KEY (deliverable_id) REFERENCES deliverable(id),
    CONSTRAINT fk_ppt_assigned_employee FOREIGN KEY (assigned_employee_id) REFERENCES employee(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ppt_studio_status ON post_production_task(studio_id, status);
CREATE INDEX IF NOT EXISTS idx_ppt_studio_priority ON post_production_task(studio_id, priority);
CREATE INDEX IF NOT EXISTS idx_ppt_studio_employee ON post_production_task(studio_id, assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_ppt_studio_due_date ON post_production_task(studio_id, due_date);
CREATE INDEX IF NOT EXISTS idx_ppt_studio_deliverable ON post_production_task(studio_id, deliverable_id);
CREATE INDEX IF NOT EXISTS idx_ppt_studio_project ON post_production_task(studio_id, project_id);
