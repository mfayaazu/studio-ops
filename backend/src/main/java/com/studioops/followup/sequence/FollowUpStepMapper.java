package com.studioops.followup.sequence;

import com.studioops.followup.sequence.dto.FollowUpStepResponse;

public class FollowUpStepMapper {

    public static FollowUpStepResponse toResponse(FollowUpStep step) {
        if (step == null) {
            return null;
        }
        FollowUpStepResponse response = new FollowUpStepResponse();
        response.setId(step.getId());
        response.setStudioId(step.getStudioId());
        response.setSequenceId(step.getSequenceId());
        response.setStepOrder(step.getStepOrder());
        response.setDelayDays(step.getDelayDays());
        response.setChannel(step.getChannel());
        response.setTemplateId(step.getTemplateId());
        response.setGoal(step.getGoal());
        response.setActive(step.isActive());
        response.setCreatedAt(step.getCreatedAt());
        response.setUpdatedAt(step.getUpdatedAt());
        return response;
    }
}
