package com.studioops.followup.task;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.followup.template.CommunicationChannel;
import com.studioops.followup.task.dto.FollowUpTaskCreateRequest;
import com.studioops.followup.task.dto.FollowUpTaskResponse;
import com.studioops.followup.task.dto.FollowUpTaskUpdateRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.time.Instant;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FollowUpTaskController.class)
@Import(SecurityConfig.class)
class FollowUpTaskControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FollowUpTaskService followUpTaskService;

    @Test
    void createTask_Success() throws Exception {
        UUID projectId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        FollowUpTaskCreateRequest request = new FollowUpTaskCreateRequest(
                null, projectId, clientId, null, null, null,
                CommunicationChannel.EMAIL, Instant.now(), FollowUpTaskStatus.PENDING_APPROVAL,
                "client@example.com", "Test Title", "Body content"
        );
        FollowUpTaskResponse response = new FollowUpTaskResponse(
                UUID.randomUUID(), TenantConstants.DEFAULT_STUDIO_ID, projectId, clientId, null, null, null,
                CommunicationChannel.EMAIL, request.getScheduledAt(), FollowUpTaskStatus.PENDING_APPROVAL,
                "client@example.com", "Test Title", "Body content", null, null, null, null,
                Instant.now(), Instant.now()
        );

        when(followUpTaskService.createTask(any(FollowUpTaskCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/follow-up-tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"))
                .andExpect(jsonPath("$.channel").value("EMAIL"))
                .andExpect(jsonPath("$.messageBody").value("Body content"));
    }

    @Test
    void createTask_InvalidPayload_BadRequest() throws Exception {
        FollowUpTaskCreateRequest request = new FollowUpTaskCreateRequest(
                null, null, null, null, null, null,
                null, null, null, null, null, ""
        );

        mockMvc.perform(post("/api/follow-up-tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.channel").exists())
                .andExpect(jsonPath("$.errors.scheduledAt").exists())
                .andExpect(jsonPath("$.errors.messageBody").exists());

        verify(followUpTaskService, never()).createTask(any());
    }

    @Test
    void getTaskById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        FollowUpTaskResponse response = new FollowUpTaskResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, null, null, null, null, null,
                CommunicationChannel.WHATSAPP, Instant.now(), FollowUpTaskStatus.PENDING_APPROVAL,
                "recipient", null, "Hello!", null, null, null, null,
                Instant.now(), Instant.now()
        );

        when(followUpTaskService.getTaskById(id)).thenReturn(response);

        mockMvc.perform(get("/api/follow-up-tasks/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.channel").value("WHATSAPP"))
                .andExpect(jsonPath("$.messageBody").value("Hello!"));
    }

    @Test
    void getTaskById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(followUpTaskService.getTaskById(id)).thenThrow(new ResourceNotFoundException("Follow-up task not found"));

        mockMvc.perform(get("/api/follow-up-tasks/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void listTasks_Success() throws Exception {
        FollowUpTaskResponse response = new FollowUpTaskResponse(
                UUID.randomUUID(), TenantConstants.DEFAULT_STUDIO_ID, null, null, null, null, null,
                CommunicationChannel.WHATSAPP, Instant.now(), FollowUpTaskStatus.PENDING_APPROVAL,
                "recipient", null, "Hello!", null, null, null, null,
                Instant.now(), Instant.now()
        );

        when(followUpTaskService.listTasks(any(), any(), any())).thenReturn(Collections.singletonList(response));

        mockMvc.perform(get("/api/follow-up-tasks")
                .param("status", "PENDING_APPROVAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].channel").value("WHATSAPP"));
    }

    @Test
    void getDueTasks_Success() throws Exception {
        FollowUpTaskResponse response = new FollowUpTaskResponse(
                UUID.randomUUID(), TenantConstants.DEFAULT_STUDIO_ID, null, null, null, null, null,
                CommunicationChannel.EMAIL, Instant.now(), FollowUpTaskStatus.PENDING_APPROVAL,
                "recipient", "subject", "body", null, null, null, null,
                Instant.now(), Instant.now()
        );

        when(followUpTaskService.getDueTasks()).thenReturn(Collections.singletonList(response));

        mockMvc.perform(get("/api/follow-up-tasks/due"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].channel").value("EMAIL"));
    }

    @Test
    void updateTask_Success() throws Exception {
        UUID id = UUID.randomUUID();
        FollowUpTaskUpdateRequest request = new FollowUpTaskUpdateRequest(
                Instant.now(), "new@example.com", "New Subject", "New body content"
        );
        FollowUpTaskResponse response = new FollowUpTaskResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, null, null, null, null, null,
                CommunicationChannel.EMAIL, request.getScheduledAt(), FollowUpTaskStatus.PENDING_APPROVAL,
                "new@example.com", "New Subject", "New body content", null, null, null, null,
                Instant.now(), Instant.now()
        );

        when(followUpTaskService.updateTask(eq(id), any(FollowUpTaskUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/follow-up-tasks/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recipient").value("new@example.com"))
                .andExpect(jsonPath("$.subject").value("New Subject"))
                .andExpect(jsonPath("$.messageBody").value("New body content"));
    }

    @Test
    void deleteTask_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(followUpTaskService).deleteTask(id);

        mockMvc.perform(delete("/api/follow-up-tasks/{id}", id))
                .andExpect(status().isNoContent());

        verify(followUpTaskService, times(1)).deleteTask(id);
    }

    @Test
    void approveTask_Success() throws Exception {
        UUID id = UUID.randomUUID();
        FollowUpTaskResponse response = new FollowUpTaskResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, null, null, null, null, null,
                CommunicationChannel.EMAIL, Instant.now(), FollowUpTaskStatus.SENT,
                "rec", "sub", "body", null, Instant.now(), null, null,
                Instant.now(), Instant.now()
        );

        when(followUpTaskService.approveTask(id, null)).thenReturn(response);

        mockMvc.perform(post("/api/follow-up-tasks/{id}/approve", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SENT"))
                .andExpect(jsonPath("$.sentAt").exists());
    }

    @Test
    void skipTask_Success() throws Exception {
        UUID id = UUID.randomUUID();
        FollowUpTaskResponse response = new FollowUpTaskResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, null, null, null, null, null,
                CommunicationChannel.EMAIL, Instant.now(), FollowUpTaskStatus.SKIPPED,
                "rec", "sub", "body", null, null, Instant.now(), null,
                Instant.now(), Instant.now()
        );

        when(followUpTaskService.skipTask(id)).thenReturn(response);

        mockMvc.perform(post("/api/follow-up-tasks/{id}/skip", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SKIPPED"))
                .andExpect(jsonPath("$.skippedAt").exists());
    }

    @Test
    void cancelTask_Success() throws Exception {
        UUID id = UUID.randomUUID();
        FollowUpTaskResponse response = new FollowUpTaskResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, null, null, null, null, null,
                CommunicationChannel.EMAIL, Instant.now(), FollowUpTaskStatus.CANCELLED,
                "rec", "sub", "body", null, null, null, null,
                Instant.now(), Instant.now()
        );

        when(followUpTaskService.cancelTask(id)).thenReturn(response);

        mockMvc.perform(post("/api/follow-up-tasks/{id}/cancel", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}
