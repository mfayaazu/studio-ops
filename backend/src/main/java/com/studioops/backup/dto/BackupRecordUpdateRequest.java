package com.studioops.backup.dto;
import com.studioops.backup.BackupLocationType;
import com.studioops.backup.BackupStatus;
import com.studioops.backup.BackupType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public class BackupRecordUpdateRequest {

    @NotNull(message = "backupType is required")
    private BackupType backupType;

    @NotNull(message = "locationType is required")
    private BackupLocationType locationType;

    @NotBlank(message = "destinationPath is required")
    @Size(max = 500, message = "destinationPath must not exceed 500 characters")
    private String destinationPath;

    @NotNull(message = "status is required")
    private BackupStatus status;

    private String notes;

    private Instant verifiedAt;

    public BackupRecordUpdateRequest() {
    }

    public BackupRecordUpdateRequest(BackupType backupType, BackupLocationType locationType, String destinationPath, BackupStatus status, String notes, Instant verifiedAt) {
        this.backupType = backupType;
        this.locationType = locationType;
        this.destinationPath = destinationPath;
        this.status = status;
        this.notes = notes;
        this.verifiedAt = verifiedAt;
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
}
