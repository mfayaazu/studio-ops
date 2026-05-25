package com.studioops.postproduction.subtask.dto;

import com.studioops.postproduction.subtask.PostProductionSubtaskStatus;
import jakarta.validation.constraints.NotNull;

public class PostProductionSubtaskMoveStatusRequest {

    @NotNull(message = "status is required")
    private PostProductionSubtaskStatus status;

    public PostProductionSubtaskMoveStatusRequest() {
    }

    public PostProductionSubtaskMoveStatusRequest(PostProductionSubtaskStatus status) {
        this.status = status;
    }

    public PostProductionSubtaskStatus getStatus() {
        return status;
    }

    public void setStatus(PostProductionSubtaskStatus status) {
        this.status = status;
    }
}
