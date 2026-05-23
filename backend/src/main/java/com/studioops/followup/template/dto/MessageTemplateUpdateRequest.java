package com.studioops.followup.template.dto;

import com.studioops.followup.template.CommunicationChannel;
import com.studioops.followup.template.MessageTemplateType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class MessageTemplateUpdateRequest {

    @NotBlank(message = "name is required")
    @Size(max = 150, message = "name must not exceed 150 characters")
    private String name;

    @NotNull(message = "channel is required")
    private CommunicationChannel channel;

    @NotNull(message = "templateType is required")
    private MessageTemplateType templateType;

    @Size(max = 255, message = "subject must not exceed 255 characters")
    private String subject;

    @NotBlank(message = "body is required")
    private String body;

    @NotNull(message = "active status is required")
    private Boolean active;

    public MessageTemplateUpdateRequest() {
    }

    public MessageTemplateUpdateRequest(String name, CommunicationChannel channel, MessageTemplateType templateType, String subject, String body, Boolean active) {
        this.name = name;
        this.channel = channel;
        this.templateType = templateType;
        this.subject = subject;
        this.body = body;
        this.active = active;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
