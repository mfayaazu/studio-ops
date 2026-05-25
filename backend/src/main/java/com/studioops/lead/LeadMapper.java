package com.studioops.lead;

import com.studioops.lead.dto.LeadResponse;

public class LeadMapper {

    public static LeadResponse toResponse(Lead lead) {
        if (lead == null) {
            return null;
        }
        LeadResponse response = new LeadResponse();
        response.setId(lead.getId());
        response.setStudioId(lead.getStudioId());
        response.setClientId(lead.getClientId());
        response.setProjectId(lead.getProjectId());
        response.setClientName(lead.getClientName());
        response.setPhone(lead.getPhone());
        response.setEmail(lead.getEmail());
        response.setPreferredChannel(lead.getPreferredChannel());
        response.setEventType(lead.getEventType());
        response.setEventDate(lead.getEventDate());
        response.setCity(lead.getCity());
        response.setEstimatedValue(lead.getEstimatedValue());
        response.setLeadSource(lead.getLeadSource());
        response.setPipelineStage(lead.getPipelineStage());
        response.setAssignedUserId(lead.getAssignedUserId());
        response.setLastContactedAt(lead.getLastContactedAt());
        response.setNextFollowUpAt(lead.getNextFollowUpAt());
        response.setNotes(lead.getNotes());
        response.setLostReason(lead.getLostReason());
        response.setConvertedAt(lead.getConvertedAt());
        response.setCreatedAt(lead.getCreatedAt());
        response.setUpdatedAt(lead.getUpdatedAt());
        return response;
    }
}
