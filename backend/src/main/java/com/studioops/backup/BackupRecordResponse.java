package com.studioops.backup;

import java.time.Instant;
import java.util.UUID;

public class BackupRecordResponse {

    private UUID id;
    private UUID projectId;
    private UUID deliverableId;
    private BackupType backupType;
    private BackupLocationType locationType;
    private String destinationPath;
    private BackupStatus status;
    private String notes;
    private Instant verifiedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public BackupRecordResponse() {
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

    public UUID getDeliverableId() {
        return deliverableId;
    }

    public void setDeliverableId(UUID deliverableId) {
        this.deliverableId = deliverableId;
    }

    public BackupType getBackupType() {
        return backupType;
    }

    public void setBackupType(BackupType backupType) {
        this.backupType = backupType;
    }

    public BackupLocationType getLocationType() {
        return locationType;
    }

    public void setLocationType(BackupLocationType locationType) {
        this.locationType = locationType;
    }

    public String getDestinationPath() {
        return destinationPath;
    }

    public void setDestinationPath(String destinationPath) {
        this.destinationPath = destinationPath;
    }

    public BackupStatus getStatus() {
        return status;
    }

    public void setStatus(BackupStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(Instant verifiedAt) {
        this.verifiedAt = verifiedAt;
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
