package com.studioops.postproduction.task.dto;

import com.studioops.postproduction.task.PostProductionTaskPriority;
import com.studioops.postproduction.task.PostProductionTaskStatus;
import com.studioops.postproduction.task.PostProductionTaskType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class PostProductionTaskUpdateRequest {

    @NotBlank(message = "title is required")
    @Size(max = 200, message = "title must not exceed 200 characters")
    private String title;

    private String description;

    @NotNull(message = "taskType is required")
    private PostProductionTaskType taskType;

    @NotNull(message = "priority is required")
    private PostProductionTaskPriority priority;

    @NotNull(message = "status is required")
    private PostProductionTaskStatus status;

    private UUID assignedEmployeeId;

    private LocalDate dueDate;

    private BigDecimal estimatedHours;

    private BigDecimal actualHours;

    private Integer sortOrder;

    public PostProductionTaskUpdateRequest() {
    }

    public PostProductionTaskUpdateRequest(String title, String description, PostProductionTaskType taskType, PostProductionTaskPriority priority, PostProductionTaskStatus status, UUID assignedEmployeeId, LocalDate dueDate, BigDecimal estimatedHours, BigDecimal actualHours, Integer sortOrder) {
        this.title = title;
        this.description = description;
        this.taskType = taskType;
        this.priority = priority;
        this.status = status;
        this.assignedEmployeeId = assignedEmployeeId;
        this.dueDate = dueDate;
        this.estimatedHours = estimatedHours;
        this.actualHours = actualHours;
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
}
