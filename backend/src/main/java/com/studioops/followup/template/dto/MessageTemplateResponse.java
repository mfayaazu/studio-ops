package com.studioops.followup.template.dto;

import com.studioops.followup.template.CommunicationChannel;
import com.studioops.followup.template.MessageTemplateType;
import java.time.Instant;
import java.util.UUID;

public class MessageTemplateResponse {

    private UUID id;
    private UUID studioId;
    private String name;
    private CommunicationChannel channel;
    private MessageTemplateType templateType;
    private String subject;
    private String body;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public MessageTemplateResponse() {
    }

    public MessageTemplateResponse(UUID id, UUID studioId, String name, CommunicationChannel channel, MessageTemplateType templateType, String subject, String body, boolean active, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.studioId = studioId;
        this.name = name;
        this.channel = channel;
        this.templateType = templateType;
        this.subject = subject;
        this.body = body;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public CommunicationChannel getChannel() {
        return channel;
    }

    public void setChannel(CommunicationChannel channel) {
        this.channel = channel;
    }

    public MessageTemplateType getTemplateType() {
        return templateType;
    }

    public void setTemplateType(MessageTemplateType templateType) {
        this.templateType = templateType;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
