package com.studioops.followup.log;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.followup.template.CommunicationChannel;
import com.studioops.followup.log.dto.CommunicationLogCreateRequest;
import com.studioops.followup.log.dto.CommunicationLogResponse;
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
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CommunicationLogController.class)
@Import(SecurityConfig.class)
class CommunicationLogControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CommunicationLogService communicationLogService;

    @Test
    void createLog_Success() throws Exception {
        UUID projectId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        CommunicationLogCreateRequest request = new CommunicationLogCreateRequest(
                null, projectId, clientId, null,
                CommunicationChannel.EMAIL, CommunicationDirection.OUTBOUND,
                "client@example.com", "Subject", "Body content",
                CommunicationProvider.MANUAL_DEMO, null, CommunicationLogStatus.SENT,
                Instant.now(), null, null, null
        );
        CommunicationLogResponse response = new CommunicationLogResponse(
                UUID.randomUUID(), TenantConstants.DEFAULT_STUDIO_ID, projectId, clientId, null,
                CommunicationChannel.EMAIL, CommunicationDirection.OUTBOUND,
                "client@example.com", "Subject", "Body content",
                CommunicationProvider.MANUAL_DEMO, null, CommunicationLogStatus.SENT,
                request.getSentAt(), null, null, null, Instant.now()
        );

        when(communicationLogService.createLog(any(CommunicationLogCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/communication-logs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.status").value("SENT"))
                .andExpect(jsonPath("$.direction").value("OUTBOUND"))
                .andExpect(jsonPath("$.channel").value("EMAIL"));
    }

    @Test
    void createLog_InvalidPayload_BadRequest() throws Exception {
        CommunicationLogCreateRequest request = new CommunicationLogCreateRequest(
                null, null, null, null,
                null, null, null, null, null,
                null, null, null, null, null, null, null
        );

        mockMvc.perform(post("/api/communication-logs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.channel").exists())
                .andExpect(jsonPath("$.errors.direction").exists())
                .andExpect(jsonPath("$.errors.status").exists());

        verify(communicationLogService, never()).createLog(any());
    }

    @Test
    void getLogById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        CommunicationLogResponse response = new CommunicationLogResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, null, null, null,
                CommunicationChannel.WHATSAPP, CommunicationDirection.OUTBOUND,
                "recipient", null, "Hello!", CommunicationProvider.MANUAL_DEMO, null,
                CommunicationLogStatus.SENT, Instant.now(), null, null, null, Instant.now()
        );

        when(communicationLogService.getLogById(id)).thenReturn(response);

        mockMvc.perform(get("/api/communication-logs/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.channel").value("WHATSAPP"))
                .andExpect(jsonPath("$.messageBody").value("Hello!"));
    }

    @Test
    void getLogById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(communicationLogService.getLogById(id)).thenThrow(new ResourceNotFoundException("Log not found"));

        mockMvc.perform(get("/api/communication-logs/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void listLogs_Success() throws Exception {
        CommunicationLogResponse response = new CommunicationLogResponse(
                UUID.randomUUID(), TenantConstants.DEFAULT_STUDIO_ID, null, null, null,
                CommunicationChannel.WHATSAPP, CommunicationDirection.OUTBOUND,
                "recipient", null, "Hello!", CommunicationProvider.MANUAL_DEMO, null,
                CommunicationLogStatus.SENT, Instant.now(), null, null, null, Instant.now()
        );

        when(communicationLogService.listLogs()).thenReturn(Collections.singletonList(response));

        mockMvc.perform(get("/api/communication-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].channel").value("WHATSAPP"));
    }
}
