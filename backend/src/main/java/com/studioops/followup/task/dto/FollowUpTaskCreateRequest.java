package com.studioops.followup.task.dto;

import com.studioops.followup.template.CommunicationChannel;
import com.studioops.followup.task.FollowUpTaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public class FollowUpTaskCreateRequest {

    private UUID studioId;
    private UUID projectId;
    private UUID clientId;
    private UUID sequenceId;
    private UUID stepId;
    private UUID templateId;

    @NotNull(message = "channel is required")
    private CommunicationChannel channel;

    @NotNull(message = "scheduledAt is required")
    private Instant scheduledAt;

    private FollowUpTaskStatus status;
    private String recipient;
    private String subject;

    @NotBlank(message = "messageBody is required")
    private String messageBody;

    private boolean isDraft;
    private String draftMessage;
    private com.studioops.lead.LeadPriority priority;

    public FollowUpTaskCreateRequest() {
    }

    public FollowUpTaskCreateRequest(UUID studioId, UUID projectId, UUID clientId, UUID sequenceId, UUID stepId, UUID templateId, CommunicationChannel channel, Instant scheduledAt, FollowUpTaskStatus status, String recipient, String subject, String messageBody) {
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
    }

    // Getters and Setters

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

    public boolean getIsDraft() {
        return isDraft;
    }

    public void setIsDraft(boolean isDraft) {
        this.isDraft = isDraft;
    }

    public String getDraftMessage() {
        return draftMessage;
    }

    public void setDraftMessage(String draftMessage) {
        this.draftMessage = draftMessage;
    }

    public com.studioops.lead.LeadPriority getPriority() {
        return priority;
    }

    public void setPriority(com.studioops.lead.LeadPriority priority) {
        this.priority = priority;
    }
}
