package com.studioops.user.dto;

import com.studioops.user.AccessLevel;
import com.studioops.user.PageKey;

public class UserPagePermissionResponse {
    private PageKey pageKey;
    private AccessLevel accessLevel;

    public UserPagePermissionResponse() {
    }

    public UserPagePermissionResponse(PageKey pageKey, AccessLevel accessLevel) {
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
