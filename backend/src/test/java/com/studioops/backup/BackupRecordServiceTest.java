package com.studioops.backup;

import com.studioops.deliverable.Deliverable;
import com.studioops.deliverable.DeliverableRepository;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.project.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import com.studioops.backup.dto.BackupRecordCreateRequest;
import com.studioops.backup.dto.BackupRecordResponse;
import com.studioops.backup.dto.BackupRecordUpdateRequest;

class BackupRecordServiceTest {

    @Mock
    private BackupRecordRepository backupRecordRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private DeliverableRepository deliverableRepository;

    @InjectMocks
    private BackupRecordService backupRecordService;

    private UUID projectId;
    private UUID deliverableId;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        projectId = UUID.randomUUID();
        deliverableId = UUID.randomUUID();
    }

    @Test
    void createBackup_Success() {
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                projectId, deliverableId, BackupType.RAW_PHOTOS, BackupLocationType.LOCAL_NAS,
                "NAS_Volume_2/photos.zip", BackupStatus.COMPLETED, "Initial backup", Instant.now()
        );

        when(projectRepository.existsById(projectId)).thenReturn(true);

        Deliverable deliverable = new Deliverable();
        deliverable.setId(deliverableId);
        deliverable.setProjectId(projectId);
        when(deliverableRepository.findById(deliverableId)).thenReturn(Optional.of(deliverable));

        BackupRecord record = new BackupRecord();
        record.setId(UUID.randomUUID());
        record.setProjectId(projectId);
        record.setDeliverableId(deliverableId);
        record.setBackupType(request.getBackupType());
        record.setLocationType(request.getLocationType());
        record.setDestinationPath(request.getDestinationPath());
        record.setStatus(request.getStatus());

        when(backupRecordRepository.save(any(BackupRecord.class))).thenReturn(record);

        BackupRecordResponse response = backupRecordService.createBackup(request);

        assertNotNull(response);
        assertEquals(record.getId(), response.getId());
        assertEquals(projectId, response.getProjectId());
        assertEquals(deliverableId, response.getDeliverableId());
        verify(backupRecordRepository, times(1)).save(any(BackupRecord.class));
    }

    @Test
    void createBackup_ProjectNotFound_ThrowsException() {
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                projectId, null, BackupType.RAW_PHOTOS, BackupLocationType.LOCAL_NAS,
                "NAS_Volume_2/photos.zip", BackupStatus.COMPLETED, null, null
        );

        when(projectRepository.existsById(projectId)).thenReturn(false);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> backupRecordService.createBackup(request));
        assertTrue(exception.getMessage().contains("Project not found with id"));
        verify(backupRecordRepository, never()).save(any(BackupRecord.class));
    }

    @Test
    void createBackup_DeliverableNotFound_ThrowsException() {
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                projectId, deliverableId, BackupType.RAW_PHOTOS, BackupLocationType.LOCAL_NAS,
                "NAS_Volume_2/photos.zip", BackupStatus.COMPLETED, null, null
        );

        when(projectRepository.existsById(projectId)).thenReturn(true);
        when(deliverableRepository.findById(deliverableId)).thenReturn(Optional.empty());

        Exception exception = assertThrows(IllegalArgumentException.class, () -> backupRecordService.createBackup(request));
        assertTrue(exception.getMessage().contains("Deliverable not found with id"));
        verify(backupRecordRepository, never()).save(any(BackupRecord.class));
    }

    @Test
    void createBackup_DeliverableProjectMismatch_ThrowsException() {
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                projectId, deliverableId, BackupType.RAW_PHOTOS, BackupLocationType.LOCAL_NAS,
                "NAS_Volume_2/photos.zip", BackupStatus.COMPLETED, null, null
        );

        when(projectRepository.existsById(projectId)).thenReturn(true);

        Deliverable deliverable = new Deliverable();
        deliverable.setId(deliverableId);
        deliverable.setProjectId(UUID.randomUUID()); // Mismatch project id
        when(deliverableRepository.findById(deliverableId)).thenReturn(Optional.of(deliverable));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> backupRecordService.createBackup(request));
        assertTrue(exception.getMessage().contains("Deliverable must belong to the same project"));
        verify(backupRecordRepository, never()).save(any(BackupRecord.class));
    }

    @Test
    void listBackups_All() {
        BackupRecord r1 = new BackupRecord();
        r1.setProjectId(projectId);
        BackupRecord r2 = new BackupRecord();
        r2.setProjectId(UUID.randomUUID());

        when(backupRecordRepository.findAll()).thenReturn(List.of(r1, r2));

        List<BackupRecordResponse> list = backupRecordService.listBackups(null, null);

        assertEquals(2, list.size());
        verify(backupRecordRepository, times(1)).findAll();
    }

    @Test
    void listBackups_ByProject() {
        BackupRecord r1 = new BackupRecord();
        r1.setProjectId(projectId);

        when(backupRecordRepository.findByProjectId(projectId)).thenReturn(List.of(r1));

        List<BackupRecordResponse> list = backupRecordService.listBackups(projectId, null);

        assertEquals(1, list.size());
        assertEquals(projectId, list.get(0).getProjectId());
    }

    @Test
    void getBackupById_Success() {
        UUID id = UUID.randomUUID();
        BackupRecord record = new BackupRecord();
        record.setId(id);
        record.setProjectId(projectId);
        record.setBackupType(BackupType.RAW_PHOTOS);

        when(backupRecordRepository.findById(id)).thenReturn(Optional.of(record));

        BackupRecordResponse response = backupRecordService.getBackupById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
    }

    @Test
    void getBackupById_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(backupRecordRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> backupRecordService.getBackupById(id));
    }

    @Test
    void updateBackup_Success() {
        UUID id = UUID.randomUUID();
        BackupRecord record = new BackupRecord();
        record.setId(id);
        record.setProjectId(projectId);
        record.setBackupType(BackupType.RAW_PHOTOS);
        record.setLocationType(BackupLocationType.LOCAL_NAS);
        record.setStatus(BackupStatus.PENDING);
        record.setDestinationPath("path1");

        BackupRecordUpdateRequest request = new BackupRecordUpdateRequest(
                BackupType.EDITED_PHOTOS, BackupLocationType.CLOUD_S3, "s3://path",
                BackupStatus.COMPLETED, "note", null
        );

        when(backupRecordRepository.findById(id)).thenReturn(Optional.of(record));
        when(backupRecordRepository.save(any(BackupRecord.class))).thenReturn(record);

        BackupRecordResponse response = backupRecordService.updateBackup(id, request);

        assertNotNull(response);
        assertEquals(BackupType.EDITED_PHOTOS, response.getBackupType());
        assertEquals(BackupLocationType.CLOUD_S3, response.getLocationType());
        assertEquals("s3://path", response.getDestinationPath());
        assertEquals(BackupStatus.COMPLETED, response.getStatus());
    }

    @Test
    void getDistinctCompletedBackupLocationsCount() {
        when(backupRecordRepository.findDistinctCompletedLocationTypesByDeliverableId(deliverableId))
                .thenReturn(List.of(BackupLocationType.LOCAL_NAS, BackupLocationType.CLOUD_S3));

        int count = backupRecordService.getDistinctCompletedBackupLocationsCount(deliverableId);

        assertEquals(2, count);
        verify(backupRecordRepository, times(1)).findDistinctCompletedLocationTypesByDeliverableId(deliverableId);
    }
}
