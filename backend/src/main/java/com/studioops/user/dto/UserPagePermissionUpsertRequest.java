package com.studioops.user.dto;

import com.studioops.user.AccessLevel;
import com.studioops.user.PageKey;
import jakarta.validation.constraints.NotNull;

public class UserPagePermissionUpsertRequest {

    @NotNull(message = "Page key is required")
    private PageKey pageKey;

    @NotNull(message = "Access level is required")
    private AccessLevel accessLevel;

    public UserPagePermissionUpsertRequest() {
    }

    public UserPagePermissionUpsertRequest(PageKey pageKey, AccessLevel accessLevel) {
        this.pageKey = pageKey;
        this.accessLevel = accessLevel;
    }

    public PageKey getPageKey() {
        return pageKey;
    }

    public void setPageKey(PageKey pageKey) {
        this.pageKey = pageKey;
    }

    public AccessLevel getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(AccessLevel accessLevel) {
        this.accessLevel = accessLevel;
    }
}
