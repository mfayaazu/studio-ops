CREATE TABLE follow_up_sequence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_follow_up_sequence_studio FOREIGN KEY (studio_id) REFERENCES studio(id),
    CONSTRAINT uq_follow_up_sequence_studio_name UNIQUE (studio_id, name)
);

CREATE TABLE follow_up_step (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    sequence_id UUID NOT NULL,
    step_order INTEGER NOT NULL,
    delay_days INTEGER NOT NULL,
    channel VARCHAR(50) NOT NULL,
    template_id UUID NOT NULL,
    goal VARCHAR(150),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_follow_up_step_studio FOREIGN KEY (studio_id) REFERENCES studio(id),
    CONSTRAINT fk_follow_up_step_sequence FOREIGN KEY (sequence_id) REFERENCES follow_up_sequence(id) ON DELETE CASCADE,
    CONSTRAINT fk_follow_up_step_template FOREIGN KEY (template_id) REFERENCES message_template(id),
    CONSTRAINT uq_follow_up_step_sequence_order UNIQUE (sequence_id, step_order)
);
