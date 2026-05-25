package com.studioops.postproduction.subtask.dto;

import com.studioops.postproduction.subtask.PostProductionSubtaskStatus;
import java.time.Instant;
import java.util.UUID;

public class PostProductionSubtaskResponse {

    private UUID id;
    private UUID studioId;
    private UUID taskId;
    private String title;
    private String description;
    private PostProductionSubtaskStatus status;
    private UUID assignedEmployeeId;
    private Integer sortOrder;
    private Instant completedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public PostProductionSubtaskResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getStudioId() {
        return studioId;
    }

    public void setStudioId(UUID studioId) {
        this.studioId = studioId;
    }

    public UUID getTaskId() {
        return taskId;
    }

    public void setTaskId(UUID taskId) {
        this.taskId = taskId;
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

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
