CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- LOCAL/DEV SEED USER ONLY - MUST BE CHANGED OR REMOVED BEFORE PRODUCTION
-- Email: owner@studioops.local
-- Password: ChangeMe123!
INSERT INTO users (email, password_hash, role, status, display_name)
VALUES ('owner@studioops.local', '$2a$10$H6vsjg5UAjHWeYnf0KQqEem8iQq9DzmsfjWinD3Jfn/w2AF/rNjo.', 'OWNER', 'ACTIVE', 'Studio Owner');
