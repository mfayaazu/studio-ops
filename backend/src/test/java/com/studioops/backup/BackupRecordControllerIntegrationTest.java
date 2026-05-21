package com.studioops.backup;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.studioops.backup.dto.BackupRecordCreateRequest;
import com.studioops.backup.dto.BackupRecordResponse;
import com.studioops.backup.dto.BackupRecordUpdateRequest;

@WebMvcTest(BackupRecordController.class)
@Import(SecurityConfig.class)
class BackupRecordControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BackupRecordService backupRecordService;

    @Test
    void createBackup_Success() throws Exception {
        UUID projectId = UUID.randomUUID();
        UUID deliverableId = UUID.randomUUID();
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                projectId, deliverableId, BackupType.RAW_PHOTOS, BackupLocationType.LOCAL_NAS,
                "NAS_Volume_2/photos.zip", BackupStatus.COMPLETED, "Initial backup", Instant.now()
        );

        BackupRecordResponse response = new BackupRecordResponse();
        response.setId(UUID.randomUUID());
        response.setProjectId(projectId);
        response.setDeliverableId(deliverableId);
        response.setBackupType(BackupType.RAW_PHOTOS);
        response.setLocationType(BackupLocationType.LOCAL_NAS);
        response.setDestinationPath("NAS_Volume_2/photos.zip");
        response.setStatus(BackupStatus.COMPLETED);

        when(backupRecordService.createBackup(any(BackupRecordCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/backups")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.destinationPath").value("NAS_Volume_2/photos.zip"))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void createBackup_InvalidPayload_BadRequest() throws Exception {
        BackupRecordCreateRequest request = new BackupRecordCreateRequest(
                null, null, null, null, "", null, null, null
        );

        mockMvc.perform(post("/api/backups")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.projectId").exists())
                .andExpect(jsonPath("$.errors.backupType").exists())
                .andExpect(jsonPath("$.errors.locationType").exists())
                .andExpect(jsonPath("$.errors.destinationPath").exists())
                .andExpect(jsonPath("$.errors.status").exists());

        verify(backupRecordService, never()).createBackup(any(BackupRecordCreateRequest.class));
    }

    @Test
    void listBackups_Success() throws Exception {
        UUID projectId = UUID.randomUUID();
        BackupRecordResponse response = new BackupRecordResponse();
        response.setId(UUID.randomUUID());
        response.setProjectId(projectId);
        response.setBackupType(BackupType.EDITED_PHOTOS);
        response.setLocationType(BackupLocationType.CLOUD_S3);
        response.setDestinationPath("s3://bucket/photos.zip");
        response.setStatus(BackupStatus.COMPLETED);

        when(backupRecordService.listBackups(projectId, null)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/backups")
                .param("projectId", projectId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].destinationPath").value("s3://bucket/photos.zip"));
    }

    @Test
    void getBackupById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        BackupRecordResponse response = new BackupRecordResponse();
        response.setId(id);
        response.setProjectId(UUID.randomUUID());
        response.setBackupType(BackupType.RAW_VIDEOS);
        response.setLocationType(BackupLocationType.EXTERNAL_HARD_DRIVE);
        response.setDestinationPath("Drive E:/videos");
        response.setStatus(BackupStatus.IN_PROGRESS);

        when(backupRecordService.getBackupById(id)).thenReturn(response);

        mockMvc.perform(get("/api/backups/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.destinationPath").value("Drive E:/videos"));
    }

    @Test
    void getBackupById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(backupRecordService.getBackupById(id)).thenThrow(new ResourceNotFoundException("Backup not found"));

        mockMvc.perform(get("/api/backups/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateBackup_Success() throws Exception {
        UUID id = UUID.randomUUID();
        BackupRecordUpdateRequest request = new BackupRecordUpdateRequest(
                BackupType.RAW_VIDEOS, BackupLocationType.LOCAL_NAS, "NAS/raw_videos.zip",
                BackupStatus.COMPLETED, "note updated", null
        );

        BackupRecordResponse response = new BackupRecordResponse();
        response.setId(id);
        response.setProjectId(UUID.randomUUID());
        response.setDestinationPath("NAS/raw_videos.zip");
        response.setStatus(BackupStatus.COMPLETED);

        when(backupRecordService.updateBackup(eq(id), any(BackupRecordUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/backups/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.destinationPath").value("NAS/raw_videos.zip"))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void deleteBackup_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(backupRecordService).deleteBackup(id);

        mockMvc.perform(delete("/api/backups/{id}", id))
                .andExpect(status().isNoContent());

        verify(backupRecordService, times(1)).deleteBackup(id);
    }
}
