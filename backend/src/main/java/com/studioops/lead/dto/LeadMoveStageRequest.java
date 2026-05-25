package com.studioops.lead.dto;

import com.studioops.lead.LeadLostReason;
import com.studioops.lead.LeadPipelineStage;
import jakarta.validation.constraints.NotNull;

public class LeadMoveStageRequest {

    @NotNull(message = "pipelineStage is required")
    private LeadPipelineStage pipelineStage;

    private LeadLostReason lostReason;
    private String notes;

    public LeadMoveStageRequest() {
    }

    public LeadMoveStageRequest(LeadPipelineStage pipelineStage, LeadLostReason lostReason, String notes) {
        this.pipelineStage = pipelineStage;
        this.lostReason = lostReason;
        this.notes = notes;
    }

    // Getters and Setters

    public LeadPipelineStage getPipelineStage() {
        return pipelineStage;
    }

    public void setPipelineStage(LeadPipelineStage pipelineStage) {
        this.pipelineStage = pipelineStage;
    }

    public LeadLostReason getLostReason() {
        return lostReason;
    }

    public void setLostReason(LeadLostReason lostReason) {
        this.lostReason = lostReason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
