CREATE TABLE event_assignment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    assignment_role VARCHAR(100) NOT NULL,
    assignment_status VARCHAR(50) NOT NULL,
    call_time TIME,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_assignment_event FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_employee FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
);
