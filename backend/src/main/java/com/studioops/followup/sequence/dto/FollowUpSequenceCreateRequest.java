package com.studioops.followup.sequence.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class FollowUpSequenceCreateRequest {

    private UUID studioId;

    @NotBlank(message = "name is required")
    @Size(max = 150, message = "name must not exceed 150 characters")
    private String name;

    private String description;

    private Boolean active;

    public FollowUpSequenceCreateRequest() {
    }

    public FollowUpSequenceCreateRequest(UUID studioId, String name, String description, Boolean active) {
        this.studioId = studioId;
        this.name = name;
        this.description = description;
        this.active = active;
    }

    public UUID getStudioId() {
        return studioId;
    }

    public void setStudioId(UUID studioId) {
        this.studioId = studioId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
