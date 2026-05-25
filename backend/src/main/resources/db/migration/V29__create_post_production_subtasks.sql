CREATE TABLE post_production_subtask (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    task_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    assigned_employee_id UUID,
    sort_order INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_pps_studio FOREIGN KEY (studio_id) REFERENCES studio(id),
    CONSTRAINT fk_pps_task FOREIGN KEY (task_id) REFERENCES post_production_task(id) ON DELETE CASCADE,
    CONSTRAINT fk_pps_assigned_employee FOREIGN KEY (assigned_employee_id) REFERENCES employee(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pps_studio_task ON post_production_subtask(studio_id, task_id);
CREATE INDEX IF NOT EXISTS idx_pps_studio_status ON post_production_subtask(studio_id, status);
CREATE INDEX IF NOT EXISTS idx_pps_studio_employee ON post_production_subtask(studio_id, assigned_employee_id);
