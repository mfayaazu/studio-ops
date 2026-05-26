-- V34__create_quotations.sql
-- Create quotation table and corresponding indexes

CREATE TABLE quotation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    lead_id UUID,
    project_id UUID,
    client_id UUID,
    quotation_number VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    valid_until DATE,
    sent_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_quotation_studio FOREIGN KEY (studio_id) REFERENCES studio(id) ON DELETE CASCADE,
    CONSTRAINT fk_quotation_lead FOREIGN KEY (lead_id) REFERENCES "lead"(id) ON DELETE SET NULL,
    CONSTRAINT fk_quotation_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE SET NULL,
    CONSTRAINT fk_quotation_client FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE SET NULL,
    CONSTRAINT uq_quotation_studio_number UNIQUE (studio_id, quotation_number)
);

CREATE INDEX idx_quotation_studio_status ON quotation (studio_id, status);
CREATE INDEX idx_quotation_studio_lead ON quotation (studio_id, lead_id);
CREATE INDEX idx_quotation_studio_project ON quotation (studio_id, project_id);
CREATE INDEX idx_quotation_studio_client ON quotation (studio_id, client_id);
