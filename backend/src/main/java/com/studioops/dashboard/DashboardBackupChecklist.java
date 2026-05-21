package com.studioops.dashboard;

import java.util.UUID;

public class DashboardBackupChecklist {
    private UUID projectId;
    private String projectName;
    private UUID deliverableId;
    private String deliverableName;
    private int redundantBackupCount;
    private String status;
    private String details;

    public DashboardBackupChecklist() {
    }

    public DashboardBackupChecklist(UUID projectId, String projectName, UUID deliverableId, String deliverableName, int redundantBackupCount, String status, String details) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.deliverableId = deliverableId;
        this.deliverableName = deliverableName;
        this.redundantBackupCount = redundantBackupCount;
        this.status = status;
        this.details = details;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public UUID getDeliverableId() {
        return deliverableId;
    }

    public void setDeliverableId(UUID deliverableId) {
        this.deliverableId = deliverableId;
    }

    public String getDeliverableName() {
        return deliverableName;
    }

    public void setDeliverableName(String deliverableName) {
        this.deliverableName = deliverableName;
    }

    public int getRedundantBackupCount() {
        return redundantBackupCount;
    }

    public void setRedundantBackupCount(int redundantBackupCount) {
        this.redundantBackupCount = redundantBackupCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
