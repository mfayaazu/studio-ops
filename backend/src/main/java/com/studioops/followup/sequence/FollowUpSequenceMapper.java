package com.studioops.followup.sequence;

import com.studioops.followup.sequence.dto.FollowUpSequenceResponse;

public class FollowUpSequenceMapper {

    public static FollowUpSequenceResponse toResponse(FollowUpSequence sequence) {
        if (sequence == null) {
            return null;
        }
        FollowUpSequenceResponse response = new FollowUpSequenceResponse();
        response.setId(sequence.getId());
        response.setStudioId(sequence.getStudioId());
        response.setName(sequence.getName());
        response.setDescription(sequence.getDescription());
        response.setActive(sequence.isActive());
        response.setApplicableStage(sequence.getApplicableStage());
        response.setCreatedAt(sequence.getCreatedAt());
        response.setUpdatedAt(sequence.getUpdatedAt());
        return response;
    }
}
