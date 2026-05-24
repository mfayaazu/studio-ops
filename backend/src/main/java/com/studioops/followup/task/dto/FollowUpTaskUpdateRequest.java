package com.studioops.followup.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class FollowUpTaskUpdateRequest {

    @NotNull(message = "scheduledAt is required")
    private Instant scheduledAt;

    private String recipient;
    private String subject;

    @NotBlank(message = "messageBody is required")
    private String messageBody;

    public FollowUpTaskUpdateRequest() {
    }

    public FollowUpTaskUpdateRequest(Instant scheduledAt, String recipient, String subject, String messageBody) {
        this.scheduledAt = scheduledAt;
        this.recipient = recipient;
        this.subject = subject;
        this.messageBody = messageBody;
    }

    // Getters and Setters

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
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
}
