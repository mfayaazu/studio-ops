package com.studioops.followup.sequence.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class FollowUpSequenceUpdateRequest {

    @NotBlank(message = "name is required")
    @Size(max = 150, message = "name must not exceed 150 characters")
    private String name;

    private String description;

    @NotNull(message = "active is required")
    private Boolean active;

    private com.studioops.lead.LeadPipelineStage applicableStage;

    public FollowUpSequenceUpdateRequest() {
    }

    public FollowUpSequenceUpdateRequest(String name, String description, Boolean active, com.studioops.lead.LeadPipelineStage applicableStage) {
        this.name = name;
        this.description = description;
        this.active = active;
        this.applicableStage = applicableStage;
    }

    public FollowUpSequenceUpdateRequest(String name, String description, Boolean active) {
        this(name, description, active, com.studioops.lead.LeadPipelineStage.NEW_LEAD);
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

    public com.studioops.lead.LeadPipelineStage getApplicableStage() {
        return applicableStage;
    }

    public void setApplicableStage(com.studioops.lead.LeadPipelineStage applicableStage) {
        this.applicableStage = applicableStage;
    }
}
