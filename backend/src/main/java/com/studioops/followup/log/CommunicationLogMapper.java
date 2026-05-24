package com.studioops.followup.log;

import com.studioops.followup.log.dto.CommunicationLogResponse;

public class CommunicationLogMapper {

    public static CommunicationLogResponse toResponse(CommunicationLog log) {
        if (log == null) {
            return null;
        }
        CommunicationLogResponse response = new CommunicationLogResponse();
        response.setId(log.getId());
        response.setStudioId(log.getStudioId());
        response.setProjectId(log.getProjectId());
        response.setClientId(log.getClientId());
        response.setFollowUpTaskId(log.getFollowUpTaskId());
        response.setChannel(log.getChannel());
        response.setDirection(log.getDirection());
        response.setRecipient(log.getRecipient());
        response.setSubject(log.getSubject());
        response.setMessageBody(log.getMessageBody());
        response.setProvider(log.getProvider());
        response.setProviderMessageId(log.getProviderMessageId());
        response.setStatus(log.getStatus());
        response.setSentAt(log.getSentAt());
        response.setDeliveredAt(log.getDeliveredAt());
        response.setReadAt(log.getReadAt());
        response.setErrorMessage(log.getErrorMessage());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }
}
