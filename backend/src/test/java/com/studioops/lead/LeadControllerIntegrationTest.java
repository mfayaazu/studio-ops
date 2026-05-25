package com.studioops.lead;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.lead.dto.LeadCreateRequest;
import com.studioops.lead.dto.LeadMoveStageRequest;
import com.studioops.lead.dto.LeadResponse;
import com.studioops.lead.dto.LeadUpdateRequest;
import com.studioops.lead.dto.LeadConvertToProjectRequest;
import com.studioops.lead.dto.LeadConvertToProjectResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LeadController.class)
@Import(SecurityConfig.class)
class LeadControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LeadService leadService;

    @Test
    void createLead_Success() throws Exception {
        LeadCreateRequest request = new LeadCreateRequest(
                null, null, null, "Priya Reddy", "+919876543210", "priya@example.in",
                LeadPreferredChannel.WHATSAPP, "Wedding Photography", LocalDate.of(2026, 9, 12),
                "Hyderabad", BigDecimal.valueOf(350000), LeadSource.WEBSITE, null,
                null, null, null, "Notes here"
        );
        LeadResponse response = new LeadResponse(
                UUID.randomUUID(), TenantConstants.DEFAULT_STUDIO_ID, null, null, "Priya Reddy", "+919876543210", "priya@example.in",
                LeadPreferredChannel.WHATSAPP, "Wedding Photography", request.getEventDate(),
                "Hyderabad", request.getEstimatedValue(), LeadSource.WEBSITE, LeadPipelineStage.NEW_LEAD,
                null, null, null, "Notes here", null, Instant.now(), Instant.now()
        );

        when(leadService.createLead(any(LeadCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/leads")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.clientName").value("Priya Reddy"))
                .andExpect(jsonPath("$.preferredChannel").value("WHATSAPP"))
                .andExpect(jsonPath("$.leadSource").value("WEBSITE"))
                .andExpect(jsonPath("$.pipelineStage").value("NEW_LEAD"));
    }

    @Test
    void createLead_ValidationErrors_BadRequest() throws Exception {
        // missing clientName, preferredChannel, leadSource
        LeadCreateRequest request = new LeadCreateRequest(
                null, null, null, "", null, null,
                null, null, null, null, null, null, null,
                null, null, null, null
        );

        mockMvc.perform(post("/api/leads")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.clientName").exists())
                .andExpect(jsonPath("$.errors.preferredChannel").exists())
                .andExpect(jsonPath("$.errors.leadSource").exists());

        verify(leadService, never()).createLead(any());
    }

    @Test
    void getLeadById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        LeadResponse response = new LeadResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, null, null, "Priya Reddy", null, null,
                LeadPreferredChannel.WHATSAPP, null, null, null, null, LeadSource.WEBSITE,
                LeadPipelineStage.NEW_LEAD, null, null, null, null, null, Instant.now(), Instant.now()
        );

        when(leadService.getLeadById(id)).thenReturn(response);

        mockMvc.perform(get("/api/leads/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.clientName").value("Priya Reddy"));
    }

    @Test
    void getLeadById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(leadService.getLeadById(id)).thenThrow(new ResourceNotFoundException("Lead not found"));

        mockMvc.perform(get("/api/leads/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void listLeads_Success() throws Exception {
        LeadResponse response = new LeadResponse(
                UUID.randomUUID(), TenantConstants.DEFAULT_STUDIO_ID, null, null, "Priya Reddy", null, null,
                LeadPreferredChannel.WHATSAPP, null, null, null, null, LeadSource.WEBSITE,
                LeadPipelineStage.NEW_LEAD, null, null, null, null, null, Instant.now(), Instant.now()
        );

        when(leadService.listLeads(any(), any(), any())).thenReturn(Collections.singletonList(response));

        mockMvc.perform(get("/api/leads")
                .param("search", "Priya"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].clientName").value("Priya Reddy"));
    }

    @Test
    void updateLead_Success() throws Exception {
        UUID id = UUID.randomUUID();
        LeadUpdateRequest request = new LeadUpdateRequest(
                "Updated Name", "12345", "new@example.com", LeadPreferredChannel.WHATSAPP,
                "Engagement", null, "Mumbai", null, LeadSource.INSTAGRAM, null, null, null, "Notes"
        );
        LeadResponse response = new LeadResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, null, null, "Updated Name", "12345", "new@example.com",
                LeadPreferredChannel.WHATSAPP, "Engagement", null, "Mumbai", null, LeadSource.INSTAGRAM,
                LeadPipelineStage.NEW_LEAD, null, null, null, "Notes", null, Instant.now(), Instant.now()
        );

        when(leadService.updateLead(eq(id), any(LeadUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/leads/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientName").value("Updated Name"))
                .andExpect(jsonPath("$.phone").value("12345"))
                .andExpect(jsonPath("$.email").value("new@example.com"));
    }

    @Test
    void moveStage_Success() throws Exception {
        UUID id = UUID.randomUUID();
        LeadMoveStageRequest request = new LeadMoveStageRequest(
                LeadPipelineStage.LOST, LeadLostReason.BOOKED_COMPETITOR, "Chose freelancer"
        );
        LeadResponse response = new LeadResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, null, null, "Priya Reddy", null, null,
                LeadPreferredChannel.WHATSAPP, null, null, null, null, LeadSource.WEBSITE,
                LeadPipelineStage.LOST, null, null, null, "Chose freelancer", LeadLostReason.BOOKED_COMPETITOR,
                Instant.now(), Instant.now()
        );

        when(leadService.moveStage(eq(id), any(LeadMoveStageRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/leads/{id}/move-stage", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pipelineStage").value("LOST"))
                .andExpect(jsonPath("$.lostReason").value("BOOKED_COMPETITOR"));
    }

    @Test
    void deleteLead_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(leadService).deleteLead(id);

        mockMvc.perform(delete("/api/leads/{id}", id))
                .andExpect(status().isNoContent());

        verify(leadService, times(1)).deleteLead(id);
    }

    @Test
    void convertToProject_Success() throws Exception {
        UUID leadId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        Instant convertedAt = Instant.now();

        LeadConvertToProjectRequest request = new LeadConvertToProjectRequest(
                "CODE123", "Custom Project Title", "Wedding Photography",
                null, null, null, "Project note"
        );

        LeadConvertToProjectResponse response = new LeadConvertToProjectResponse(
                leadId, clientId, projectId, LeadPipelineStage.CONFIRMED, convertedAt, "Lead converted to project successfully"
        );

        when(leadService.convertLeadToProject(eq(leadId), any(LeadConvertToProjectRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/leads/{id}/convert-to-project", leadId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leadId").value(leadId.toString()))
                .andExpect(jsonPath("$.clientId").value(clientId.toString()))
                .andExpect(jsonPath("$.projectId").value(projectId.toString()))
                .andExpect(jsonPath("$.pipelineStage").value("CONFIRMED"))
                .andExpect(jsonPath("$.message").value("Lead converted to project successfully"));
    }
}
