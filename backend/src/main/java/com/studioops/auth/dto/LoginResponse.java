package com.studioops.auth.dto;

import com.studioops.user.dto.UserResponse;

public class LoginResponse {
    private String status;
    private UserResponse user;

    public LoginResponse() {
    }

    public LoginResponse(String status, UserResponse user) {
        this.status = status;
        this.user = user;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }
}
