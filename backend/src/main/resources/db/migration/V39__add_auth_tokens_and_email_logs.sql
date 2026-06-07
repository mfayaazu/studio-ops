-- V39__add_auth_tokens_and_email_logs.sql

-- Add columns to users table
ALTER TABLE users ADD COLUMN invite_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN invite_token_expires_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN password_reset_token_expires_at TIMESTAMP WITH TIME ZONE NULL;

-- Create system_email_log table
CREATE TABLE system_email_log (
    id UUID PRIMARY KEY,
    studio_id UUID NOT NULL,
    user_id UUID NULL,
    recipient VARCHAR(255) NOT NULL,
    email_type VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_system_email_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Add index for searchability
CREATE INDEX idx_system_email_log_studio ON system_email_log(studio_id);
CREATE INDEX idx_system_email_log_recipient ON system_email_log(recipient);
