package com.studioops.followup.template;

import com.studioops.followup.template.dto.MessageTemplateResponse;

public class MessageTemplateMapper {

    public static MessageTemplateResponse toResponse(MessageTemplate template) {
        if (template == null) {
            return null;
        }
        MessageTemplateResponse response = new MessageTemplateResponse();
        response.setId(template.getId());
        response.setStudioId(template.getStudioId());
        response.setName(template.getName());
        response.setChannel(template.getChannel());
        response.setTemplateType(template.getTemplateType());
        response.setSubject(template.getSubject());
        response.setBody(template.getBody());
        response.setActive(template.isActive());
        response.setCreatedAt(template.getCreatedAt());
        response.setUpdatedAt(template.getUpdatedAt());
        return response;
    }
}
