CREATE TABLE message_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_message_template_studio FOREIGN KEY (studio_id) REFERENCES studio(id),
    CONSTRAINT uq_message_template_studio_name_channel UNIQUE (studio_id, name, channel)
);
