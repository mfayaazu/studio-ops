package com.studioops.backup;

import com.studioops.deliverable.Deliverable;
import com.studioops.deliverable.DeliverableRepository;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.project.ProjectRepository;
import com.studioops.studio.StudioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import com.studioops.backup.dto.BackupRecordCreateRequest;
import com.studioops.backup.dto.BackupRecordResponse;
import com.studioops.backup.dto.BackupRecordUpdateRequest;

@Service
@Transactional
public class BackupRecordService {

    private final BackupRecordRepository backupRecordRepository;
    private final ProjectRepository projectRepository;
    private final DeliverableRepository deliverableRepository;
    private final StudioRepository studioRepository;

    public BackupRecordService(BackupRecordRepository backupRecordRepository,
                               ProjectRepository projectRepository,
                               DeliverableRepository deliverableRepository,
                               StudioRepository studioRepository) {
        this.backupRecordRepository = backupRecordRepository;
        this.projectRepository = projectRepository;
        this.deliverableRepository = deliverableRepository;
        this.studioRepository = studioRepository;
    }

    public BackupRecordResponse createBackup(BackupRecordCreateRequest request) {
        UUID studioId = request.getStudioId() != null ? request.getStudioId() : TenantConstants.DEFAULT_STUDIO_ID;

        // Validate studio exists
        if (!studioRepository.existsById(studioId)) {
            throw new ResourceNotFoundException("Studio not found with id: " + studioId);
        }

        // Validate project exists and belongs to the same studio
        projectRepository.findByIdAndStudioId(request.getProjectId(), studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        // Validate deliverable if provided
        if (request.getDeliverableId() != null) {
            Deliverable deliverable = deliverableRepository.findByIdAndStudioId(request.getDeliverableId(), studioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found with id: " + request.getDeliverableId()));
            if (!deliverable.getProjectId().equals(request.getProjectId())) {
                throw new IllegalArgumentException("Deliverable must belong to the same project");
            }
        }

        BackupRecord backupRecord = BackupRecordMapper.toEntity(request);
        backupRecord.setStudioId(studioId);

        BackupRecord saved = backupRecordRepository.save(backupRecord);
        return BackupRecordMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BackupRecordResponse> listBackups(UUID projectId, UUID deliverableId) {
        List<BackupRecord> records;
        UUID studioId = TenantConstants.DEFAULT_STUDIO_ID;

        if (projectId != null) {
            // Validate project belongs to default studio
            projectRepository.findByIdAndStudioId(projectId, studioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        }
        if (deliverableId != null) {
            // Validate deliverable belongs to default studio
            deliverableRepository.findByIdAndStudioId(deliverableId, studioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found with id: " + deliverableId));
        }

        if (projectId != null && deliverableId != null) {
            records = backupRecordRepository.findByDeliverableIdAndStudioId(deliverableId, studioId).stream()
                    .filter(r -> r.getProjectId().equals(projectId))
                    .toList();
        } else if (projectId != null) {
            records = backupRecordRepository.findByProjectIdAndStudioId(projectId, studioId);
        } else if (deliverableId != null) {
            records = backupRecordRepository.findByDeliverableIdAndStudioId(deliverableId, studioId);
        } else {
            records = backupRecordRepository.findAllByStudioId(studioId);
        }
        return records.stream()
                .map(BackupRecordMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BackupRecordResponse getBackupById(UUID id) {
        BackupRecord record = backupRecordRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Backup record not found with id: " + id));
        return BackupRecordMapper.toResponse(record);
    }

    public BackupRecordResponse updateBackup(UUID id, BackupRecordUpdateRequest request) {
        BackupRecord record = backupRecordRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Backup record not found with id: " + id));

        BackupRecordMapper.updateEntity(record, request);
        BackupRecord saved = backupRecordRepository.save(record);
        return BackupRecordMapper.toResponse(saved);
    }

    public void deleteBackup(UUID id) {
        BackupRecord record = backupRecordRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Backup record not found with id: " + id));
        backupRecordRepository.delete(record);
    }

    @Transactional(readOnly = true)
    public int getDistinctCompletedBackupLocationsCount(UUID deliverableId) {
        if (deliverableId == null) {
            return 0;
        }
        UUID studioId = TenantConstants.DEFAULT_STUDIO_ID;
        deliverableRepository.findByIdAndStudioId(deliverableId, studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found with id: " + deliverableId));

        List<BackupLocationType> locations = backupRecordRepository.findDistinctCompletedLocationTypesByDeliverableIdAndStudioId(deliverableId, studioId);
        return locations.size();
    }
}
