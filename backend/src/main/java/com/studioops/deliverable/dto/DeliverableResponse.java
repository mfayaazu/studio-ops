package com.studioops.deliverable.dto;
import com.studioops.deliverable.DeliverableStatus;
import com.studioops.deliverable.DeliverableType;
import com.studioops.deliverable.DeliverablePriority;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class DeliverableResponse {

    private UUID id;
    private UUID projectId;
    private UUID studioId;
    private String name;
    private DeliverableType deliverableType;
    private DeliverableStatus status;
    private DeliverablePriority priority;
    private UUID assignedEmployeeId;
    private String referenceUrl;
    private LocalDate dueDate;
    private Instant createdAt;
    private Instant updatedAt;

    public DeliverableResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public UUID getStudioId() {
        return studioId;
    }

    public void setStudioId(UUID studioId) {
        this.studioId = studioId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DeliverableType getDeliverableType() {
        return deliverableType;
    }

    public void setDeliverableType(DeliverableType deliverableType) {
        this.deliverableType = deliverableType;
    }

    public DeliverableStatus getStatus() {
        return status;
    }

    public void setStatus(DeliverableStatus status) {
        this.status = status;
    }

    public DeliverablePriority getPriority() {
        return priority;
    }

    public void setPriority(DeliverablePriority priority) {
        this.priority = priority;
    }

    public UUID getAssignedEmployeeId() {
        return assignedEmployeeId;
    }

    public void setAssignedEmployeeId(UUID assignedEmployeeId) {
        this.assignedEmployeeId = assignedEmployeeId;
    }

    public String getReferenceUrl() {
        return referenceUrl;
    }

    public void setReferenceUrl(String referenceUrl) {
        this.referenceUrl = referenceUrl;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
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
