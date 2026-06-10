package com.studioops.followup.sequence.dto;

import java.time.Instant;
import java.util.UUID;

public class FollowUpSequenceResponse {

    private UUID id;
    private UUID studioId;
    private String name;
    private String description;
    private boolean active;
    private com.studioops.lead.LeadPipelineStage applicableStage;
    private Instant createdAt;
    private Instant updatedAt;

    public FollowUpSequenceResponse() {
    }

    public FollowUpSequenceResponse(UUID id, UUID studioId, String name, String description, boolean active, com.studioops.lead.LeadPipelineStage applicableStage, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.studioId = studioId;
        this.name = name;
        this.description = description;
        this.active = active;
        this.applicableStage = applicableStage;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public FollowUpSequenceResponse(UUID id, UUID studioId, String name, String description, boolean active, Instant createdAt, Instant updatedAt) {
        this(id, studioId, name, description, active, com.studioops.lead.LeadPipelineStage.NEW_LEAD, createdAt, updatedAt);
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public com.studioops.lead.LeadPipelineStage getApplicableStage() {
        return applicableStage;
    }

    public void setApplicableStage(com.studioops.lead.LeadPipelineStage applicableStage) {
        this.applicableStage = applicableStage;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
