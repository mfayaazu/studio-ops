package com.studioops.backup;

import com.studioops.deliverable.Deliverable;
import com.studioops.deliverable.DeliverableRepository;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
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
    private final TenantContext tenantContext;

    public BackupRecordService(BackupRecordRepository backupRecordRepository,
                               ProjectRepository projectRepository,
                               DeliverableRepository deliverableRepository,
                               StudioRepository studioRepository,
                               TenantContext tenantContext) {
        this.backupRecordRepository = backupRecordRepository;
        this.projectRepository = projectRepository;
        this.deliverableRepository = deliverableRepository;
        this.studioRepository = studioRepository;
        this.tenantContext = tenantContext;
    }

    public BackupRecordResponse createBackup(BackupRecordCreateRequest request) {
        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

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
        UUID studioId = tenantContext.getCurrentStudioId();

        if (projectId != null) {
            // Validate project belongs to studio
            projectRepository.findByIdAndStudioId(projectId, studioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        }
        if (deliverableId != null) {
            // Validate deliverable belongs to studio
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
        BackupRecord record = backupRecordRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Backup record not found with id: " + id));
        return BackupRecordMapper.toResponse(record);
    }

    public BackupRecordResponse updateBackup(UUID id, BackupRecordUpdateRequest request) {
        BackupRecord record = backupRecordRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Backup record not found with id: " + id));

        BackupRecordMapper.updateEntity(record, request);
        BackupRecord saved = backupRecordRepository.save(record);
        return BackupRecordMapper.toResponse(saved);
    }

    public void deleteBackup(UUID id) {
        BackupRecord record = backupRecordRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Backup record not found with id: " + id));
        backupRecordRepository.delete(record);
    }

    @Transactional(readOnly = true)
    public int getDistinctCompletedBackupLocationsCount(UUID deliverableId) {
        if (deliverableId == null) {
            return 0;
        }
        UUID studioId = tenantContext.getCurrentStudioId();
        deliverableRepository.findByIdAndStudioId(deliverableId, studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found with id: " + deliverableId));

        List<BackupLocationType> locations = backupRecordRepository.findDistinctCompletedLocationTypesByDeliverableIdAndStudioId(deliverableId, studioId);
        return locations.size();
    }
}
