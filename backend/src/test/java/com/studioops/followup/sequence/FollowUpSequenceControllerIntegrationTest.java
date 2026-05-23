package com.studioops.followup.sequence;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.followup.sequence.dto.FollowUpSequenceCreateRequest;
import com.studioops.followup.sequence.dto.FollowUpSequenceResponse;
import com.studioops.followup.sequence.dto.FollowUpSequenceUpdateRequest;
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

@WebMvcTest(FollowUpSequenceController.class)
@Import(SecurityConfig.class)
class FollowUpSequenceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FollowUpSequenceService followUpSequenceService;

    @Test
    void createSequence_Success() throws Exception {
        FollowUpSequenceCreateRequest request = new FollowUpSequenceCreateRequest(
                null, "Standard Funnel", "A standard sequence", true
        );
        FollowUpSequenceResponse response = new FollowUpSequenceResponse(
                UUID.randomUUID(), TenantConstants.DEFAULT_STUDIO_ID, "Standard Funnel", "A standard sequence", true,
                Instant.now(), Instant.now()
        );

        when(followUpSequenceService.createSequence(any(FollowUpSequenceCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/follow-up-sequences")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.studioId").value(TenantConstants.DEFAULT_STUDIO_ID.toString()))
                .andExpect(jsonPath("$.name").value("Standard Funnel"))
                .andExpect(jsonPath("$.description").value("A standard sequence"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void createSequence_InvalidPayload_BadRequest() throws Exception {
        FollowUpSequenceCreateRequest request = new FollowUpSequenceCreateRequest(
                null, "", "Desc", null
        );

        mockMvc.perform(post("/api/follow-up-sequences")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists());

        verify(followUpSequenceService, never()).createSequence(any(FollowUpSequenceCreateRequest.class));
    }

    @Test
    void getSequenceById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        FollowUpSequenceResponse response = new FollowUpSequenceResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, "Standard", "Desc", true,
                Instant.now(), Instant.now()
        );

        when(followUpSequenceService.getSequenceById(id)).thenReturn(response);

        mockMvc.perform(get("/api/follow-up-sequences/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Standard"));
    }

    @Test
    void getSequenceById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(followUpSequenceService.getSequenceById(id)).thenThrow(new ResourceNotFoundException("Sequence not found"));

        mockMvc.perform(get("/api/follow-up-sequences/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void updateSequence_Success() throws Exception {
        UUID id = UUID.randomUUID();
        FollowUpSequenceUpdateRequest request = new FollowUpSequenceUpdateRequest(
                "Updated", "New Desc", false
        );
        FollowUpSequenceResponse response = new FollowUpSequenceResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, "Updated", "New Desc", false,
                Instant.now(), Instant.now()
        );

        when(followUpSequenceService.updateSequence(eq(id), any(FollowUpSequenceUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/follow-up-sequences/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"))
                .andExpect(jsonPath("$.description").value("New Desc"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void deleteSequence_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(followUpSequenceService).deleteSequence(id);

        mockMvc.perform(delete("/api/follow-up-sequences/{id}", id))
                .andExpect(status().isNoContent());

        verify(followUpSequenceService, times(1)).deleteSequence(id);
    }
}
