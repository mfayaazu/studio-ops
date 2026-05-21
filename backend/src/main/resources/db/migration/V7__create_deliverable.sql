CREATE TABLE deliverable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    deliverable_type VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
    reference_url VARCHAR(1000),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_deliverable_project FOREIGN KEY (project_id) REFERENCES project(id)
);
