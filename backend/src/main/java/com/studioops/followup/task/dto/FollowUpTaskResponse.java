package com.studioops.followup.task.dto;

import com.studioops.followup.template.CommunicationChannel;
import com.studioops.followup.task.FollowUpTaskStatus;
import java.time.Instant;
import java.util.UUID;

public class FollowUpTaskResponse {

    private UUID id;
    private UUID studioId;
    private UUID projectId;
    private UUID clientId;
    private UUID sequenceId;
    private UUID stepId;
    private UUID templateId;
    private CommunicationChannel channel;
    private Instant scheduledAt;
    private FollowUpTaskStatus status;
    private String recipient;
    private String subject;
    private String messageBody;
    private UUID approvedByUserId;
    private Instant sentAt;
    private Instant skippedAt;
    private String failureReason;
    private Instant createdAt;
    private Instant updatedAt;

    public FollowUpTaskResponse() {
    }

    public FollowUpTaskResponse(UUID id, UUID studioId, UUID projectId, UUID clientId, UUID sequenceId, UUID stepId, UUID templateId, CommunicationChannel channel, Instant scheduledAt, FollowUpTaskStatus status, String recipient, String subject, String messageBody, UUID approvedByUserId, Instant sentAt, Instant skippedAt, String failureReason, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.studioId = studioId;
        this.projectId = projectId;
        this.clientId = clientId;
        this.sequenceId = sequenceId;
        this.stepId = stepId;
        this.templateId = templateId;
        this.channel = channel;
        this.scheduledAt = scheduledAt;
        this.status = status;
        this.recipient = recipient;
        this.subject = subject;
        this.messageBody = messageBody;
        this.approvedByUserId = approvedByUserId;
        this.sentAt = sentAt;
        this.skippedAt = skippedAt;
        this.failureReason = failureReason;
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

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public UUID getClientId() {
        return clientId;
    }

    public void setClientId(UUID clientId) {
        this.clientId = clientId;
    }

    public UUID getSequenceId() {
        return sequenceId;
    }

    public void setSequenceId(UUID sequenceId) {
        this.sequenceId = sequenceId;
    }

    public UUID getStepId() {
        return stepId;
    }

    public void setStepId(UUID stepId) {
        this.stepId = stepId;
    }

    public UUID getTemplateId() {
        return templateId;
    }

    public void setTemplateId(UUID templateId) {
        this.templateId = templateId;
    }

    public CommunicationChannel getChannel() {
        return channel;
    }

    public void setChannel(CommunicationChannel channel) {
        this.channel = channel;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public FollowUpTaskStatus getStatus() {
        return status;
    }

    public void setStatus(FollowUpTaskStatus status) {
        this.status = status;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessageBody() {
        return messageBody;
    }

    public void setMessageBody(String messageBody) {
        this.messageBody = messageBody;
    }

    public UUID getApprovedByUserId() {
        return approvedByUserId;
    }

    public void setApprovedByUserId(UUID approvedByUserId) {
        this.approvedByUserId = approvedByUserId;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    public Instant getSkippedAt() {
        return skippedAt;
    }

    public void setSkippedAt(Instant skippedAt) {
        this.skippedAt = skippedAt;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
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
