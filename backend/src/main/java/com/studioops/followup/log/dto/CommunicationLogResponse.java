package com.studioops.followup.log.dto;

import com.studioops.followup.template.CommunicationChannel;
import com.studioops.followup.log.CommunicationDirection;
import com.studioops.followup.log.CommunicationProvider;
import com.studioops.followup.log.CommunicationLogStatus;
import java.time.Instant;
import java.util.UUID;

public class CommunicationLogResponse {

    private UUID id;
    private UUID studioId;
    private UUID projectId;
    private UUID clientId;
    private UUID followUpTaskId;
    private CommunicationChannel channel;
    private CommunicationDirection direction;
    private String recipient;
    private String subject;
    private String messageBody;
    private CommunicationProvider provider;
    private String providerMessageId;
    private CommunicationLogStatus status;
    private Instant sentAt;
    private Instant deliveredAt;
    private Instant readAt;
    private String errorMessage;
    private Instant createdAt;

    public CommunicationLogResponse() {
    }

    public CommunicationLogResponse(UUID id, UUID studioId, UUID projectId, UUID clientId, UUID followUpTaskId, CommunicationChannel channel, CommunicationDirection direction, String recipient, String subject, String messageBody, CommunicationProvider provider, String providerMessageId, CommunicationLogStatus status, Instant sentAt, Instant deliveredAt, Instant readAt, String errorMessage, Instant createdAt) {
        this.id = id;
        this.studioId = studioId;
        this.projectId = projectId;
        this.clientId = clientId;
        this.followUpTaskId = followUpTaskId;
        this.channel = channel;
        this.direction = direction;
        this.recipient = recipient;
        this.subject = subject;
        this.messageBody = messageBody;
        this.provider = provider;
        this.providerMessageId = providerMessageId;
        this.status = status;
        this.sentAt = sentAt;
        this.deliveredAt = deliveredAt;
        this.readAt = readAt;
        this.errorMessage = errorMessage;
        this.createdAt = createdAt;
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

    public UUID getFollowUpTaskId() {
        return followUpTaskId;
    }

    public void setFollowUpTaskId(UUID followUpTaskId) {
        this.followUpTaskId = followUpTaskId;
    }

    public CommunicationChannel getChannel() {
        return channel;
    }

    public void setChannel(CommunicationChannel channel) {
        this.channel = channel;
    }

    public CommunicationDirection getDirection() {
        return direction;
    }

    public void setDirection(CommunicationDirection direction) {
        this.direction = direction;
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

    public CommunicationProvider getProvider() {
        return provider;
    }

    public void setProvider(CommunicationProvider provider) {
        this.provider = provider;
    }

    public String getProviderMessageId() {
        return providerMessageId;
    }

    public void setProviderMessageId(String providerMessageId) {
        this.providerMessageId = providerMessageId;
    }

    public CommunicationLogStatus getStatus() {
        return status;
    }

    public void setStatus(CommunicationLogStatus status) {
        this.status = status;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    public Instant getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(Instant deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public Instant getReadAt() {
        return readAt;
    }

    public void setReadAt(Instant readAt) {
        this.readAt = readAt;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
