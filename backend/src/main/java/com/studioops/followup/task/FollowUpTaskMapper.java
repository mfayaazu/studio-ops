package com.studioops.followup.task;

import com.studioops.followup.task.dto.FollowUpTaskResponse;

public class FollowUpTaskMapper {

    public static FollowUpTaskResponse toResponse(FollowUpTask task) {
        if (task == null) {
            return null;
        }
        FollowUpTaskResponse response = new FollowUpTaskResponse();
        response.setId(task.getId());
        response.setStudioId(task.getStudioId());
        response.setProjectId(task.getProjectId());
        response.setClientId(task.getClientId());
        response.setLeadId(task.getLeadId());
        response.setSequenceId(task.getSequenceId());
        response.setStepId(task.getStepId());
        response.setTemplateId(task.getTemplateId());
        response.setChannel(task.getChannel());
        response.setScheduledAt(task.getScheduledAt());
        response.setStatus(task.getStatus());
        response.setRecipient(task.getRecipient());
        response.setSubject(task.getSubject());
        response.setMessageBody(task.getMessageBody());
        response.setApprovedByUserId(task.getApprovedByUserId());
        response.setSentAt(task.getSentAt());
        response.setSkippedAt(task.getSkippedAt());
        response.setFailureReason(task.getFailureReason());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        response.setIsDraft(task.getIsDraft());
        response.setDraftMessage(task.getDraftMessage());
        response.setPriority(task.getPriority());
        return response;
    }
}
