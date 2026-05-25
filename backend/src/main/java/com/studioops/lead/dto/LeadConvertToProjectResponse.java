package com.studioops.lead.dto;

import com.studioops.lead.LeadPipelineStage;
import java.time.Instant;
import java.util.UUID;

public class LeadConvertToProjectResponse {

    private UUID leadId;
    private UUID clientId;
    private UUID projectId;
    private LeadPipelineStage pipelineStage;
    private Instant convertedAt;
    private String message;

    public LeadConvertToProjectResponse() {
    }

    public LeadConvertToProjectResponse(UUID leadId, UUID clientId, UUID projectId,
                                        LeadPipelineStage pipelineStage, Instant convertedAt,
                                        String message) {
        this.leadId = leadId;
        this.clientId = clientId;
        this.projectId = projectId;
        this.pipelineStage = pipelineStage;
        this.convertedAt = convertedAt;
        this.message = message;
    }

    // Getters and Setters

    public UUID getLeadId() {
        return leadId;
    }

    public void setLeadId(UUID leadId) {
        this.leadId = leadId;
    }

    public UUID getClientId() {
        return clientId;
    }

    public void setClientId(UUID clientId) {
        this.clientId = clientId;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public LeadPipelineStage getPipelineStage() {
        return pipelineStage;
    }

    public void setPipelineStage(LeadPipelineStage pipelineStage) {
        this.pipelineStage = pipelineStage;
    }

    public Instant getConvertedAt() {
        return convertedAt;
    }

    public void setConvertedAt(Instant convertedAt) {
        this.convertedAt = convertedAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
