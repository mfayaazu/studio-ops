package com.studioops.auth.dto;

import com.studioops.user.dto.UserResponse;

public class CurrentUserResponse {
    private boolean authenticated;
    private UserResponse user;

    public CurrentUserResponse() {
    }

    public CurrentUserResponse(boolean authenticated, UserResponse user) {
        this.authenticated = authenticated;
        this.user = user;
    }

    public boolean isAuthenticated() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }
}
