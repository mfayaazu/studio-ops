package com.studioops.backup;

import com.studioops.common.tenant.TenantContext;
import com.studioops.common.tenant.TenantConstants;

import com.studioops.deliverable.Deliverable;
import com.studioops.deliverable.DeliverableRepository;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.project.Project;
import com.studioops.project.ProjectRepository;
import com.studioops.studio.StudioRepository;
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
    private TenantContext tenantContext;


    @Mock
    private BackupRecordRepository backupRecordRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private DeliverableRepository deliverableRepository;

    @Mock
    private StudioRepository studioRepository;

    @InjectMocks
    private BackupRecordService backupRecordService;

    private UUID projectId;
    private UUID deliverableId;
    private Project project;
    private Deliverable deliverable;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(tenantContext.getCurrentStudioId()).thenReturn(TenantConstants.DEFAULT_STUDIO_ID);
        projectId = UUID.randomUUID();
        deliverableId = UUID.randomUUID();

        project = new Project();
        project.setId(projectId);
        project.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        deliverable = new Deliverable();
        deliverable.setId(deliverableId);
        deliverable.setProjectId(projectId);
        deliverable.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        lenient().when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
    }

    @Test
    void createBackup_Success() {
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                projectId, deliverableId, BackupType.RAW_PHOTOS, BackupLocationType.LOCAL_NAS,
                "NAS_Volume_2/photos.zip", BackupStatus.COMPLETED, "Initial backup", Instant.now()
        );

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));
        when(deliverableRepository.findByIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(deliverable));

        BackupRecord record = new BackupRecord();
        record.setId(UUID.randomUUID());
        record.setProjectId(projectId);
        record.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
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
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
        assertEquals(deliverableId, response.getDeliverableId());
        verify(backupRecordRepository, times(1)).save(any(BackupRecord.class));
    }

    @Test
    void createBackup_DefaultsToDefaultStudio_WhenStudioIdMissing() {
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                projectId, null, BackupType.RAW_PHOTOS, BackupLocationType.LOCAL_NAS,
                "NAS_Volume_2/photos.zip", BackupStatus.COMPLETED, null, null
        );

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));

        BackupRecord record = new BackupRecord();
        record.setId(UUID.randomUUID());
        record.setProjectId(projectId);
        record.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        record.setBackupType(request.getBackupType());
        record.setLocationType(request.getLocationType());
        record.setDestinationPath(request.getDestinationPath());
        record.setStatus(request.getStatus());

        when(backupRecordRepository.save(any(BackupRecord.class))).thenReturn(record);

        BackupRecordResponse response = backupRecordService.createBackup(request);

        assertNotNull(response);
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
    }

    @Test
    void createBackup_Fails_WhenStudioIdDoesNotExist() {
        UUID customStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(customStudioId);
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                projectId, null, BackupType.RAW_PHOTOS, BackupLocationType.LOCAL_NAS,
                "NAS_Volume_2/photos.zip", BackupStatus.COMPLETED, null, null
        );
        request.setStudioId(customStudioId);

        when(studioRepository.existsById(customStudioId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> backupRecordService.createBackup(request));
        verify(backupRecordRepository, never()).save(any(BackupRecord.class));
    }

    @Test
    void createBackup_ProjectNotFound_ThrowsException() {
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                projectId, null, BackupType.RAW_PHOTOS, BackupLocationType.LOCAL_NAS,
                "NAS_Volume_2/photos.zip", BackupStatus.COMPLETED, null, null
        );

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> backupRecordService.createBackup(request));
        verify(backupRecordRepository, never()).save(any(BackupRecord.class));
    }

    @Test
    void createBackup_ProjectDoesNotBelongToSameStudio() {
        UUID customStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(customStudioId);
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                projectId, null, BackupType.RAW_PHOTOS, BackupLocationType.LOCAL_NAS,
                "NAS_Volume_2/photos.zip", BackupStatus.COMPLETED, null, null
        );
        request.setStudioId(customStudioId);

        when(projectRepository.findByIdAndStudioId(projectId, customStudioId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> backupRecordService.createBackup(request));
        verify(backupRecordRepository, never()).save(any(BackupRecord.class));
    }

    @Test
    void createBackup_DeliverableNotFound_ThrowsException() {
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                projectId, deliverableId, BackupType.RAW_PHOTOS, BackupLocationType.LOCAL_NAS,
                "NAS_Volume_2/photos.zip", BackupStatus.COMPLETED, null, null
        );

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));
        when(deliverableRepository.findByIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> backupRecordService.createBackup(request));
        verify(backupRecordRepository, never()).save(any(BackupRecord.class));
    }

    @Test
    void createBackup_DeliverableDoesNotBelongToSameStudio() {
        UUID customStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(customStudioId);
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                projectId, deliverableId, BackupType.RAW_PHOTOS, BackupLocationType.LOCAL_NAS,
                "NAS_Volume_2/photos.zip", BackupStatus.COMPLETED, null, null
        );
        request.setStudioId(customStudioId);

        when(projectRepository.findByIdAndStudioId(projectId, customStudioId)).thenReturn(Optional.of(project));
        when(deliverableRepository.findByIdAndStudioId(deliverableId, customStudioId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> backupRecordService.createBackup(request));
        verify(backupRecordRepository, never()).save(any(BackupRecord.class));
    }

    @Test
    void createBackup_DeliverableProjectMismatch_ThrowsException() {
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                projectId, deliverableId, BackupType.RAW_PHOTOS, BackupLocationType.LOCAL_NAS,
                "NAS_Volume_2/photos.zip", BackupStatus.COMPLETED, null, null
        );

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));

        Deliverable mismatchedDeliverable = new Deliverable();
        mismatchedDeliverable.setId(deliverableId);
        mismatchedDeliverable.setProjectId(UUID.randomUUID()); // Mismatched project ID
        mismatchedDeliverable.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        when(deliverableRepository.findByIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(mismatchedDeliverable));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> backupRecordService.createBackup(request));
        assertTrue(exception.getMessage().contains("Deliverable must belong to the same project"));
        verify(backupRecordRepository, never()).save(any(BackupRecord.class));
    }

    @Test
    void listBackups_All() {
        BackupRecord r1 = new BackupRecord();
        r1.setProjectId(projectId);
        r1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        BackupRecord r2 = new BackupRecord();
        r2.setProjectId(UUID.randomUUID());
        r2.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(backupRecordRepository.findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(List.of(r1, r2));

        List<BackupRecordResponse> list = backupRecordService.listBackups(null, null);

        assertEquals(2, list.size());
        verify(backupRecordRepository, times(1)).findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID);
    }

    @Test
    void listBackups_ByProject_Success() {
        BackupRecord r1 = new BackupRecord();
        r1.setProjectId(projectId);
        r1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));
        when(backupRecordRepository.findByProjectIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(List.of(r1));

        List<BackupRecordResponse> list = backupRecordService.listBackups(projectId, null);

        assertEquals(1, list.size());
        assertEquals(projectId, list.get(0).getProjectId());
    }

    @Test
    void listBackups_ByProject_ProjectNotFound() {
        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> backupRecordService.listBackups(projectId, null));
    }

    @Test
    void listBackups_ByDeliverable_Success() {
        BackupRecord r1 = new BackupRecord();
        r1.setProjectId(projectId);
        r1.setDeliverableId(deliverableId);
        r1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(deliverableRepository.findByIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(deliverable));
        when(backupRecordRepository.findByDeliverableIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(List.of(r1));

        List<BackupRecordResponse> list = backupRecordService.listBackups(null, deliverableId);

        assertEquals(1, list.size());
        assertEquals(deliverableId, list.get(0).getDeliverableId());
    }

    @Test
    void listBackups_ByDeliverable_DeliverableNotFound() {
        when(deliverableRepository.findByIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> backupRecordService.listBackups(null, deliverableId));
    }

    @Test
    void getBackupById_Success() {
        UUID id = UUID.randomUUID();
        BackupRecord record = new BackupRecord();
        record.setId(id);
        record.setProjectId(projectId);
        record.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        record.setBackupType(BackupType.RAW_PHOTOS);

        when(backupRecordRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(record));

        BackupRecordResponse response = backupRecordService.getBackupById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
    }

    @Test
    void getBackupById_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(backupRecordRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> backupRecordService.getBackupById(id));
    }

    @Test
    void updateBackup_Success() {
        UUID id = UUID.randomUUID();
        BackupRecord record = new BackupRecord();
        record.setId(id);
        record.setProjectId(projectId);
        record.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        record.setBackupType(BackupType.RAW_PHOTOS);
        record.setLocationType(BackupLocationType.LOCAL_NAS);
        record.setStatus(BackupStatus.PENDING);
        record.setDestinationPath("path1");

        BackupRecordUpdateRequest request = new BackupRecordUpdateRequest(
                BackupType.EDITED_PHOTOS, BackupLocationType.CLOUD_S3, "s3://path",
                BackupStatus.COMPLETED, "note", null
        );

        when(backupRecordRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(record));
        when(backupRecordRepository.save(any(BackupRecord.class))).thenReturn(record);

        BackupRecordResponse response = backupRecordService.updateBackup(id, request);

        assertNotNull(response);
        assertEquals(BackupType.EDITED_PHOTOS, response.getBackupType());
        assertEquals(BackupLocationType.CLOUD_S3, response.getLocationType());
        assertEquals("s3://path", response.getDestinationPath());
        assertEquals(BackupStatus.COMPLETED, response.getStatus());
    }

    @Test
    void deleteBackup_Success() {
        UUID id = UUID.randomUUID();
        BackupRecord record = new BackupRecord();
        record.setId(id);
        record.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(backupRecordRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(record));
        doNothing().when(backupRecordRepository).delete(record);

        assertDoesNotThrow(() -> backupRecordService.deleteBackup(id));
        verify(backupRecordRepository, times(1)).delete(record);
    }

    @Test
    void deleteBackup_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(backupRecordRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> backupRecordService.deleteBackup(id));
        verify(backupRecordRepository, never()).delete(any(BackupRecord.class));
    }

    @Test
    void getDistinctCompletedBackupLocationsCount_Success() {
        when(deliverableRepository.findByIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(deliverable));
        when(backupRecordRepository.findDistinctCompletedLocationTypesByDeliverableIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(List.of(BackupLocationType.LOCAL_NAS, BackupLocationType.CLOUD_S3));

        int count = backupRecordService.getDistinctCompletedBackupLocationsCount(deliverableId);

        assertEquals(2, count);
        verify(backupRecordRepository, times(1)).findDistinctCompletedLocationTypesByDeliverableIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID);
    }

    @Test
    void getDistinctCompletedBackupLocationsCount_DeliverableNotFound() {
        when(deliverableRepository.findByIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> backupRecordService.getDistinctCompletedBackupLocationsCount(deliverableId));
    }
}
