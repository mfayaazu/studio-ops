CREATE TABLE project (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL,
    assigned_project_manager_id UUID,
    project_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    booking_status VARCHAR(50) NOT NULL DEFAULT 'INQUIRY',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    status VARCHAR(50) NOT NULL DEFAULT 'LEAD',
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_project_client FOREIGN KEY (client_id) REFERENCES client(id)
);
