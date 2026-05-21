-- Initial schema setup placeholder
CREATE TABLE IF NOT EXISTS schema_version_check (
    id SERIAL PRIMARY KEY,
    initialized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_version_check DEFAULT VALUES;
