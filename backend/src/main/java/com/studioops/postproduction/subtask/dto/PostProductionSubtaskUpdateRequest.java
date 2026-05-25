package com.studioops.postproduction.subtask.dto;

import com.studioops.postproduction.subtask.PostProductionSubtaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class PostProductionSubtaskUpdateRequest {

    @NotBlank(message = "title is required")
    @Size(max = 200, message = "title must not exceed 200 characters")
    private String title;

    private String description;

    @NotNull(message = "status is required")
    private PostProductionSubtaskStatus status;

    private UUID assignedEmployeeId;

    private Integer sortOrder;

    public PostProductionSubtaskUpdateRequest() {
    }

    public PostProductionSubtaskUpdateRequest(String title, String description, PostProductionSubtaskStatus status, UUID assignedEmployeeId, Integer sortOrder) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.assignedEmployeeId = assignedEmployeeId;
        this.sortOrder = sortOrder;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public PostProductionSubtaskStatus getStatus() {
        return status;
    }

    public void setStatus(PostProductionSubtaskStatus status) {
        this.status = status;
    }

    public UUID getAssignedEmployeeId() {
        return assignedEmployeeId;
    }

    public void setAssignedEmployeeId(UUID assignedEmployeeId) {
        this.assignedEmployeeId = assignedEmployeeId;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
