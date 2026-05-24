-- V22__create_follow_up_tasks_and_communication_logs.sql
-- Create follow_up_task and communication_log tables and indexes

CREATE TABLE follow_up_task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    project_id UUID,
    client_id UUID,
    sequence_id UUID,
    step_id UUID,
    template_id UUID,
    channel VARCHAR(50) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL,
    recipient VARCHAR(255),
    subject VARCHAR(255),
    message_body TEXT NOT NULL,
    approved_by_user_id UUID,
    sent_at TIMESTAMP WITH TIME ZONE,
    skipped_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_follow_up_task_studio FOREIGN KEY (studio_id) REFERENCES studio(id),
    CONSTRAINT fk_follow_up_task_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE SET NULL,
    CONSTRAINT fk_follow_up_task_client FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE SET NULL,
    CONSTRAINT fk_follow_up_task_sequence FOREIGN KEY (sequence_id) REFERENCES follow_up_sequence(id) ON DELETE SET NULL,
    CONSTRAINT fk_follow_up_task_step FOREIGN KEY (step_id) REFERENCES follow_up_step(id) ON DELETE SET NULL,
    CONSTRAINT fk_follow_up_task_template FOREIGN KEY (template_id) REFERENCES message_template(id) ON DELETE SET NULL,
    CONSTRAINT fk_follow_up_task_approved_by FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE communication_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    project_id UUID,
    client_id UUID,
    follow_up_task_id UUID,
    channel VARCHAR(50) NOT NULL,
    direction VARCHAR(50) NOT NULL,
    recipient VARCHAR(255),
    subject VARCHAR(255),
    message_body TEXT,
    provider VARCHAR(50),
    provider_message_id VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_communication_log_studio FOREIGN KEY (studio_id) REFERENCES studio(id),
    CONSTRAINT fk_communication_log_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE SET NULL,
    CONSTRAINT fk_communication_log_client FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE SET NULL,
    CONSTRAINT fk_communication_log_task FOREIGN KEY (follow_up_task_id) REFERENCES follow_up_task(id) ON DELETE SET NULL
);

CREATE INDEX idx_follow_up_task_studio_status ON follow_up_task(studio_id, status);
CREATE INDEX idx_follow_up_task_studio_scheduled ON follow_up_task(studio_id, scheduled_at);
CREATE INDEX idx_follow_up_task_studio_project ON follow_up_task(studio_id, project_id);
CREATE INDEX idx_communication_log_studio_project ON communication_log(studio_id, project_id);
CREATE INDEX idx_communication_log_studio_client ON communication_log(studio_id, client_id);
CREATE INDEX idx_communication_log_studio_task ON communication_log(studio_id, follow_up_task_id);
