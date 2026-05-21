CREATE TABLE backup_record (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    deliverable_id UUID,
    backup_type VARCHAR(100) NOT NULL,
    location_type VARCHAR(100) NOT NULL,
    destination_path VARCHAR(500) NOT NULL,
    status VARCHAR(100) NOT NULL,
    notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_backup_project FOREIGN KEY (project_id) REFERENCES project(id),
    CONSTRAINT fk_backup_deliverable FOREIGN KEY (deliverable_id) REFERENCES deliverable(id) ON DELETE SET NULL
);
