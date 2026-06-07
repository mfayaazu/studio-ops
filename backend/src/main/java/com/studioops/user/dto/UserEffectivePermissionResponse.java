package com.studioops.user.dto;

import com.studioops.user.AccessLevel;
import com.studioops.user.PageKey;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class UserEffectivePermissionResponse {
    private UUID userId;
    private List<UserPagePermissionResponse> explicitOverrides;
    private Map<PageKey, AccessLevel> effectivePermissions;

    public UserEffectivePermissionResponse() {
    }

    public UserEffectivePermissionResponse(UUID userId, List<UserPagePermissionResponse> explicitOverrides, Map<PageKey, AccessLevel> effectivePermissions) {
        this.userId = userId;
        this.explicitOverrides = explicitOverrides;
        this.effectivePermissions = effectivePermissions;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public List<UserPagePermissionResponse> getExplicitOverrides() {
        return explicitOverrides;
    }

    public void setExplicitOverrides(List<UserPagePermissionResponse> explicitOverrides) {
        this.explicitOverrides = explicitOverrides;
    }

    public Map<PageKey, AccessLevel> getEffectivePermissions() {
        return effectivePermissions;
    }

    public void setEffectivePermissions(Map<PageKey, AccessLevel> effectivePermissions) {
        this.effectivePermissions = effectivePermissions;
    }
}
