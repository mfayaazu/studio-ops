package com.studioops.followup.sequence;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.followup.template.CommunicationChannel;
import com.studioops.followup.sequence.dto.FollowUpStepCreateRequest;
import com.studioops.followup.sequence.dto.FollowUpStepResponse;
import com.studioops.followup.sequence.dto.FollowUpStepUpdateRequest;
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

@WebMvcTest(FollowUpStepController.class)
@Import(SecurityConfig.class)
class FollowUpStepControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FollowUpStepService followUpStepService;

    @Test
    void createStep_Success() throws Exception {
        UUID sequenceId = UUID.randomUUID();
        UUID templateId = UUID.randomUUID();
        FollowUpStepCreateRequest request = new FollowUpStepCreateRequest(
                null, sequenceId, 1, 3, CommunicationChannel.EMAIL, templateId, "Check", true
        );
        FollowUpStepResponse response = new FollowUpStepResponse(
                UUID.randomUUID(), TenantConstants.DEFAULT_STUDIO_ID, sequenceId, 1, 3, CommunicationChannel.EMAIL, templateId, "Check", true,
                Instant.now(), Instant.now()
        );

        when(followUpStepService.createStep(any(FollowUpStepCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/follow-up-steps")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.sequenceId").value(sequenceId.toString()))
                .andExpect(jsonPath("$.templateId").value(templateId.toString()))
                .andExpect(jsonPath("$.stepOrder").value(1))
                .andExpect(jsonPath("$.delayDays").value(3))
                .andExpect(jsonPath("$.channel").value("EMAIL"))
                .andExpect(jsonPath("$.goal").value("Check"));
    }

    @Test
    void createStep_InvalidPayload_BadRequest() throws Exception {
        // Missing sequenceId, stepOrder, delayDays, channel, templateId
        FollowUpStepCreateRequest request = new FollowUpStepCreateRequest(
                null, null, null, -1, null, null, "Goal", null
        );

        mockMvc.perform(post("/api/follow-up-steps")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.sequenceId").exists())
                .andExpect(jsonPath("$.errors.stepOrder").exists())
                .andExpect(jsonPath("$.errors.delayDays").exists())
                .andExpect(jsonPath("$.errors.channel").exists())
                .andExpect(jsonPath("$.errors.templateId").exists());

        verify(followUpStepService, never()).createStep(any(FollowUpStepCreateRequest.class));
    }

    @Test
    void listStepsBySequence_Success() throws Exception {
        UUID sequenceId = UUID.randomUUID();
        UUID templateId = UUID.randomUUID();
        FollowUpStepResponse response = new FollowUpStepResponse(
                UUID.randomUUID(), TenantConstants.DEFAULT_STUDIO_ID, sequenceId, 1, 3, CommunicationChannel.EMAIL, templateId, "Goal", true,
                Instant.now(), Instant.now()
        );

        when(followUpStepService.listStepsBySequence(sequenceId)).thenReturn(Collections.singletonList(response));

        mockMvc.perform(get("/api/follow-up-sequences/{sequenceId}/steps", sequenceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sequenceId").value(sequenceId.toString()))
                .andExpect(jsonPath("$[0].stepOrder").value(1));
    }

    @Test
    void updateStep_Success() throws Exception {
        UUID id = UUID.randomUUID();
        UUID templateId = UUID.randomUUID();
        FollowUpStepUpdateRequest request = new FollowUpStepUpdateRequest(
                2, 5, CommunicationChannel.SMS, templateId, "New goal", false
        );
        FollowUpStepResponse response = new FollowUpStepResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, UUID.randomUUID(), 2, 5, CommunicationChannel.SMS, templateId, "New goal", false,
                Instant.now(), Instant.now()
        );

        when(followUpStepService.updateStep(eq(id), any(FollowUpStepUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/follow-up-steps/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stepOrder").value(2))
                .andExpect(jsonPath("$.delayDays").value(5))
                .andExpect(jsonPath("$.channel").value("SMS"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void deleteStep_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(followUpStepService).deleteStep(id);

        mockMvc.perform(delete("/api/follow-up-steps/{id}", id))
                .andExpect(status().isNoContent());

        verify(followUpStepService, times(1)).deleteStep(id);
    }
}
