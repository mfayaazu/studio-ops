CREATE TABLE api_request_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    request_id VARCHAR(100),
    method VARCHAR(20) NOT NULL,
    path VARCHAR(500) NOT NULL,
    status_code INT NOT NULL,
    duration_ms BIGINT NOT NULL,
    user_email VARCHAR(255),
    studio_id UUID,
    remote_ip VARCHAR(100),
    error_message TEXT
);

CREATE INDEX idx_api_request_log_created_at ON api_request_log(created_at);
CREATE INDEX idx_api_request_log_path ON api_request_log(path);
CREATE INDEX idx_api_request_log_status_code ON api_request_log(status_code);
CREATE INDEX idx_api_request_log_studio_id ON api_request_log(studio_id);
