package com.studioops.auth.dto;

import java.util.UUID;

public class SignupResponse {
    private String message;
    private UUID studioId;
    private String studioName;
    private String studioStatus;
    private String ownerEmail;

    public SignupResponse() {}

    public SignupResponse(String message, UUID studioId, String studioName, String studioStatus, String ownerEmail) {
        this.message = message;
        this.studioId = studioId;
        this.studioName = studioName;
        this.studioStatus = studioStatus;
        this.ownerEmail = ownerEmail;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public UUID getStudioId() {
        return studioId;
    }

    public void setStudioId(UUID studioId) {
        this.studioId = studioId;
    }

    public String getStudioName() {
        return studioName;
    }

    public void setStudioName(String studioName) {
        this.studioName = studioName;
    }

    public String getStudioStatus() {
        return studioStatus;
    }

    public void setStudioStatus(String studioStatus) {
        this.studioStatus = studioStatus;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }
}
