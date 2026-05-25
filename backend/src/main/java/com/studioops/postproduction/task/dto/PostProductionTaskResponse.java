package com.studioops.postproduction.task.dto;

import com.studioops.postproduction.task.PostProductionTaskPriority;
import com.studioops.postproduction.task.PostProductionTaskStatus;
import com.studioops.postproduction.task.PostProductionTaskType;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class PostProductionTaskResponse {

    private UUID id;
    private UUID studioId;
    private UUID projectId;
    private UUID deliverableId;
    private String title;
    private String description;
    private PostProductionTaskType taskType;
    private PostProductionTaskPriority priority;
    private PostProductionTaskStatus status;
    private UUID assignedEmployeeId;
    private LocalDate dueDate;
    private BigDecimal estimatedHours;
    private BigDecimal actualHours;
    private Integer sortOrder;
    private Instant createdAt;
    private Instant updatedAt;

    public PostProductionTaskResponse() {
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

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public UUID getDeliverableId() {
        return deliverableId;
    }

    public void setDeliverableId(UUID deliverableId) {
        this.deliverableId = deliverableId;
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

    public PostProductionTaskType getTaskType() {
        return taskType;
    }

    public void setTaskType(PostProductionTaskType taskType) {
        this.taskType = taskType;
    }

    public PostProductionTaskPriority getPriority() {
        return priority;
    }

    public void setPriority(PostProductionTaskPriority priority) {
        this.priority = priority;
    }

    public PostProductionTaskStatus getStatus() {
        return status;
    }

    public void setStatus(PostProductionTaskStatus status) {
        this.status = status;
    }

    public UUID getAssignedEmployeeId() {
        return assignedEmployeeId;
    }

    public void setAssignedEmployeeId(UUID assignedEmployeeId) {
        this.assignedEmployeeId = assignedEmployeeId;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public BigDecimal getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(BigDecimal estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public BigDecimal getActualHours() {
        return actualHours;
    }

    public void setActualHours(BigDecimal actualHours) {
        this.actualHours = actualHours;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
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
