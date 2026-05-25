package com.studioops.postproduction.task.dto;

import com.studioops.postproduction.task.PostProductionTaskStatus;
import jakarta.validation.constraints.NotNull;

public class PostProductionTaskMoveStatusRequest {

    @NotNull(message = "status is required")
    private PostProductionTaskStatus status;

    public PostProductionTaskMoveStatusRequest() {
    }

    public PostProductionTaskMoveStatusRequest(PostProductionTaskStatus status) {
        this.status = status;
    }

    public PostProductionTaskStatus getStatus() {
        return status;
    }

    public void setStatus(PostProductionTaskStatus status) {
        this.status = status;
    }
}
