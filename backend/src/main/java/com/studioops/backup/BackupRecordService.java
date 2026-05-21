package com.studioops.backup;

import com.studioops.deliverable.Deliverable;
import com.studioops.deliverable.DeliverableRepository;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.project.ProjectRepository;
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

    public BackupRecordService(BackupRecordRepository backupRecordRepository,
                               ProjectRepository projectRepository,
                               DeliverableRepository deliverableRepository) {
        this.backupRecordRepository = backupRecordRepository;
        this.projectRepository = projectRepository;
        this.deliverableRepository = deliverableRepository;
    }

    public BackupRecordResponse createBackup(BackupRecordCreateRequest request) {
        // Validate project exists
        if (!projectRepository.existsById(request.getProjectId())) {
            throw new IllegalArgumentException("Project not found with id: " + request.getProjectId());
        }

        // Validate deliverable if provided
        if (request.getDeliverableId() != null) {
            Deliverable deliverable = deliverableRepository.findById(request.getDeliverableId())
                    .orElseThrow(() -> new IllegalArgumentException("Deliverable not found with id: " + request.getDeliverableId()));
            if (!deliverable.getProjectId().equals(request.getProjectId())) {
                throw new IllegalArgumentException("Deliverable must belong to the same project");
            }
        }

        BackupRecord backupRecord = BackupRecordMapper.toEntity(request);
        BackupRecord saved = backupRecordRepository.save(backupRecord);
        return BackupRecordMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BackupRecordResponse> listBackups(UUID projectId, UUID deliverableId) {
        List<BackupRecord> records;
        if (projectId != null && deliverableId != null) {
            records = backupRecordRepository.findByDeliverableId(deliverableId).stream()
                    .filter(r -> r.getProjectId().equals(projectId))
                    .toList();
        } else if (projectId != null) {
            records = backupRecordRepository.findByProjectId(projectId);
        } else if (deliverableId != null) {
            records = backupRecordRepository.findByDeliverableId(deliverableId);
        } else {
            records = backupRecordRepository.findAll();
        }
        return records.stream()
                .map(BackupRecordMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BackupRecordResponse getBackupById(UUID id) {
        BackupRecord record = backupRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Backup record not found with id: " + id));
        return BackupRecordMapper.toResponse(record);
    }

    public BackupRecordResponse updateBackup(UUID id, BackupRecordUpdateRequest request) {
        BackupRecord record = backupRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Backup record not found with id: " + id));

        BackupRecordMapper.updateEntity(record, request);
        BackupRecord saved = backupRecordRepository.save(record);
        return BackupRecordMapper.toResponse(saved);
    }

    public void deleteBackup(UUID id) {
        if (!backupRecordRepository.existsById(id)) {
            throw new ResourceNotFoundException("Backup record not found with id: " + id);
        }
        backupRecordRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public int getDistinctCompletedBackupLocationsCount(UUID deliverableId) {
        if (deliverableId == null) {
            return 0;
        }
        List<BackupLocationType> locations = backupRecordRepository.findDistinctCompletedLocationTypesByDeliverableId(deliverableId);
        return locations.size();
    }
}
