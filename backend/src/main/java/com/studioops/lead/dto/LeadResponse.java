package com.studioops.lead.dto;

import com.studioops.lead.LeadLostReason;
import com.studioops.lead.LeadPipelineStage;
import com.studioops.lead.LeadPreferredChannel;
import com.studioops.lead.LeadSource;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class LeadResponse {

    private UUID id;
    private UUID studioId;
    private UUID clientId;
    private UUID projectId;
    private String clientName;
    private String phone;
    private String email;
    private LeadPreferredChannel preferredChannel;
    private String eventType;
    private LocalDate eventDate;
    private String city;
    private BigDecimal estimatedValue;
    private LeadSource leadSource;
    private LeadPipelineStage pipelineStage;
    private UUID assignedUserId;
    private Instant lastContactedAt;
    private Instant nextFollowUpAt;
    private String notes;
    private LeadLostReason lostReason;
    private Instant convertedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public LeadResponse() {
    }

    public LeadResponse(UUID id, UUID studioId, UUID clientId, UUID projectId, String clientName, String phone, String email, LeadPreferredChannel preferredChannel, String eventType, LocalDate eventDate, String city, BigDecimal estimatedValue, LeadSource leadSource, LeadPipelineStage pipelineStage, UUID assignedUserId, Instant lastContactedAt, Instant nextFollowUpAt, String notes, LeadLostReason lostReason, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.studioId = studioId;
        this.clientId = clientId;
        this.projectId = projectId;
        this.clientName = clientName;
        this.phone = phone;
        this.email = email;
        this.preferredChannel = preferredChannel;
        this.eventType = eventType;
        this.eventDate = eventDate;
        this.city = city;
        this.estimatedValue = estimatedValue;
        this.leadSource = leadSource;
        this.pipelineStage = pipelineStage;
        this.assignedUserId = assignedUserId;
        this.lastContactedAt = lastContactedAt;
        this.nextFollowUpAt = nextFollowUpAt;
        this.notes = notes;
        this.lostReason = lostReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters

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

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LeadPreferredChannel getPreferredChannel() {
        return preferredChannel;
    }

    public void setPreferredChannel(LeadPreferredChannel preferredChannel) {
        this.preferredChannel = preferredChannel;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public BigDecimal getEstimatedValue() {
        return estimatedValue;
    }

    public void setEstimatedValue(BigDecimal estimatedValue) {
        this.estimatedValue = estimatedValue;
    }

    public LeadSource getLeadSource() {
        return leadSource;
    }

    public void setLeadSource(LeadSource leadSource) {
        this.leadSource = leadSource;
    }

    public LeadPipelineStage getPipelineStage() {
        return pipelineStage;
    }

    public void setPipelineStage(LeadPipelineStage pipelineStage) {
        this.pipelineStage = pipelineStage;
    }

    public UUID getAssignedUserId() {
        return assignedUserId;
    }

    public void setAssignedUserId(UUID assignedUserId) {
        this.assignedUserId = assignedUserId;
    }

    public Instant getLastContactedAt() {
        return lastContactedAt;
    }

    public void setLastContactedAt(Instant lastContactedAt) {
        this.lastContactedAt = lastContactedAt;
    }

    public Instant getNextFollowUpAt() {
        return nextFollowUpAt;
    }

    public void setNextFollowUpAt(Instant nextFollowUpAt) {
        this.nextFollowUpAt = nextFollowUpAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LeadLostReason getLostReason() {
        return lostReason;
    }

    public void setLostReason(LeadLostReason lostReason) {
        this.lostReason = lostReason;
    }

    public Instant getConvertedAt() {
        return convertedAt;
    }

    public void setConvertedAt(Instant convertedAt) {
        this.convertedAt = convertedAt;
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
