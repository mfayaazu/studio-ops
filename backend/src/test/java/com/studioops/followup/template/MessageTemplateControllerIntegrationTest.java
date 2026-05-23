package com.studioops.followup.template;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.followup.template.dto.MessageTemplateCreateRequest;
import com.studioops.followup.template.dto.MessageTemplateResponse;
import com.studioops.followup.template.dto.MessageTemplateUpdateRequest;
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

@WebMvcTest(MessageTemplateController.class)
@Import(SecurityConfig.class)
class MessageTemplateControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MessageTemplateService messageTemplateService;

    @Test
    void createTemplate_Success() throws Exception {
        MessageTemplateCreateRequest request = new MessageTemplateCreateRequest(
                null, "Standard Welcome", CommunicationChannel.EMAIL, MessageTemplateType.QUOTE_SENT, "Welcome!", "Body here", true
        );
        MessageTemplateResponse response = new MessageTemplateResponse(
                UUID.randomUUID(), TenantConstants.DEFAULT_STUDIO_ID, "Standard Welcome", CommunicationChannel.EMAIL, MessageTemplateType.QUOTE_SENT, "Welcome!", "Body here", true,
                Instant.now(), Instant.now()
        );

        when(messageTemplateService.createTemplate(any(MessageTemplateCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/message-templates")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.studioId").value(TenantConstants.DEFAULT_STUDIO_ID.toString()))
                .andExpect(jsonPath("$.name").value("Standard Welcome"))
                .andExpect(jsonPath("$.channel").value("EMAIL"))
                .andExpect(jsonPath("$.templateType").value("QUOTE_SENT"))
                .andExpect(jsonPath("$.subject").value("Welcome!"))
                .andExpect(jsonPath("$.body").value("Body here"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void createTemplate_InvalidPayload_BadRequest() throws Exception {
        // Missing name, channel, templateType, and body
        MessageTemplateCreateRequest request = new MessageTemplateCreateRequest(
                null, "", null, null, "Subject", "", null
        );

        mockMvc.perform(post("/api/message-templates")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.channel").exists())
                .andExpect(jsonPath("$.errors.templateType").exists())
                .andExpect(jsonPath("$.errors.body").exists());

        verify(messageTemplateService, never()).createTemplate(any(MessageTemplateCreateRequest.class));
    }

    @Test
    void getTemplateById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        MessageTemplateResponse response = new MessageTemplateResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, "Welcome", CommunicationChannel.WHATSAPP, MessageTemplateType.SOFT_FOLLOW_UP, null, "Body content", true,
                Instant.now(), Instant.now()
        );

        when(messageTemplateService.getTemplateById(id)).thenReturn(response);

        mockMvc.perform(get("/api/message-templates/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Welcome"))
                .andExpect(jsonPath("$.channel").value("WHATSAPP"))
                .andExpect(jsonPath("$.body").value("Body content"));
    }

    @Test
    void getTemplateById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(messageTemplateService.getTemplateById(id)).thenThrow(new ResourceNotFoundException("Message template not found"));

        mockMvc.perform(get("/api/message-templates/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void listTemplates_Success() throws Exception {
        MessageTemplateResponse response = new MessageTemplateResponse(
                UUID.randomUUID(), TenantConstants.DEFAULT_STUDIO_ID, "Welcome", CommunicationChannel.WHATSAPP, MessageTemplateType.SOFT_FOLLOW_UP, null, "Body content", true,
                Instant.now(), Instant.now()
        );

        when(messageTemplateService.listTemplates(any())).thenReturn(Collections.singletonList(response));

        mockMvc.perform(get("/api/message-templates").param("search", "Welcome"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Welcome"))
                .andExpect(jsonPath("$[0].channel").value("WHATSAPP"));
    }

    @Test
    void updateTemplate_Success() throws Exception {
        UUID id = UUID.randomUUID();
        MessageTemplateUpdateRequest request = new MessageTemplateUpdateRequest(
                "Updated Name", CommunicationChannel.SMS, MessageTemplateType.VALUE_FOLLOW_UP, null, "New body text", false
        );
        MessageTemplateResponse response = new MessageTemplateResponse(
                id, TenantConstants.DEFAULT_STUDIO_ID, "Updated Name", CommunicationChannel.SMS, MessageTemplateType.VALUE_FOLLOW_UP, null, "New body text", false,
                Instant.now(), Instant.now()
        );

        when(messageTemplateService.updateTemplate(eq(id), any(MessageTemplateUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/message-templates/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.channel").value("SMS"))
                .andExpect(jsonPath("$.templateType").value("VALUE_FOLLOW_UP"))
                .andExpect(jsonPath("$.body").value("New body text"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void updateTemplate_InvalidPayload_BadRequest() throws Exception {
        UUID id = UUID.randomUUID();
        // Missing name, active, body
        MessageTemplateUpdateRequest request = new MessageTemplateUpdateRequest(
                "", null, MessageTemplateType.SCARCITY_FOLLOW_UP, "Subject", "", null
        );

        mockMvc.perform(put("/api/message-templates/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.channel").exists())
                .andExpect(jsonPath("$.errors.body").exists())
                .andExpect(jsonPath("$.errors.active").exists());

        verify(messageTemplateService, never()).updateTemplate(any(), any());
    }

    @Test
    void deleteTemplate_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(messageTemplateService).deleteTemplate(id);

        mockMvc.perform(delete("/api/message-templates/{id}", id))
                .andExpect(status().isNoContent());

        verify(messageTemplateService, times(1)).deleteTemplate(id);
    }
}
