package com.studioops.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @NotBlank(message = "Display name is required")
    @Size(max = 200, message = "Display name must not exceed 200 characters")
    private String displayName;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
}
