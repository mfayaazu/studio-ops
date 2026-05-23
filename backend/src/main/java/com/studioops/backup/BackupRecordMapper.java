package com.studioops.backup;
import com.studioops.backup.dto.BackupRecordCreateRequest;
import com.studioops.backup.dto.BackupRecordResponse;
import com.studioops.backup.dto.BackupRecordUpdateRequest;

public class BackupRecordMapper {

    public static BackupRecord toEntity(BackupRecordCreateRequest request) {
        BackupRecord backupRecord = new BackupRecord();
        backupRecord.setProjectId(request.getProjectId());
        backupRecord.setDeliverableId(request.getDeliverableId());
        backupRecord.setBackupType(request.getBackupType());
        backupRecord.setLocationType(request.getLocationType());
        backupRecord.setDestinationPath(request.getDestinationPath());
        backupRecord.setStatus(request.getStatus());
        backupRecord.setNotes(request.getNotes());
        backupRecord.setVerifiedAt(request.getVerifiedAt());
        return backupRecord;
    }

    public static BackupRecordResponse toResponse(BackupRecord entity) {
        BackupRecordResponse response = new BackupRecordResponse();
        response.setId(entity.getId());
        response.setProjectId(entity.getProjectId());
        response.setStudioId(entity.getStudioId());
        response.setDeliverableId(entity.getDeliverableId());
        response.setBackupType(entity.getBackupType());
        response.setLocationType(entity.getLocationType());
        response.setDestinationPath(entity.getDestinationPath());
        response.setStatus(entity.getStatus());
        response.setNotes(entity.getNotes());
        response.setVerifiedAt(entity.getVerifiedAt());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }

    public static void updateEntity(BackupRecord entity, BackupRecordUpdateRequest request) {
        entity.setBackupType(request.getBackupType());
        entity.setLocationType(request.getLocationType());
        entity.setDestinationPath(request.getDestinationPath());
        entity.setStatus(request.getStatus());
        entity.setNotes(request.getNotes());
        entity.setVerifiedAt(request.getVerifiedAt());
    }
}
