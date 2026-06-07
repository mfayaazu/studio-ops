-- V38__create_user_page_permissions.sql
-- Beta MVP: User Page Permission Overrides system for StudioOps

CREATE TABLE user_page_permission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    user_id UUID NOT NULL,
    page_key VARCHAR(80) NOT NULL,
    access_level VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_page_permission_studio FOREIGN KEY (studio_id) REFERENCES studio(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_page_permission_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_page_permission_user_page UNIQUE (studio_id, user_id, page_key),
    CONSTRAINT chk_access_level CHECK (access_level IN ('NONE', 'VIEW', 'EDIT'))
);

CREATE INDEX idx_user_page_permission_user ON user_page_permission(user_id);
