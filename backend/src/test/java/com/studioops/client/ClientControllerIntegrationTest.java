package com.studioops.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.client.dto.ClientCreateRequest;
import com.studioops.client.dto.ClientResponse;
import com.studioops.client.dto.ClientUpdateRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClientController.class)
@Import(SecurityConfig.class)
class ClientControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClientService clientService;

    @Test
    void createClient_Success() throws Exception {
        ClientCreateRequest request = new ClientCreateRequest("Jane Doe", "+46701234567", "jane.doe@example.com", "Notes");
        ClientResponse response = new ClientResponse(
            UUID.randomUUID(), "Jane Doe", "+46701234567", "jane.doe@example.com", "Notes", 
            Instant.now(), Instant.now(), TenantConstants.DEFAULT_STUDIO_ID
        );

        when(clientService.createClient(any(ClientCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.studioId").value(TenantConstants.DEFAULT_STUDIO_ID.toString()))
                .andExpect(jsonPath("$.fullName").value("Jane Doe"))
                .andExpect(jsonPath("$.phone").value("+46701234567"));
    }

    @Test
    void createClient_InvalidPayload_BadRequest() throws Exception {
        ClientCreateRequest request = new ClientCreateRequest("", "", "invalid-email", "Notes");

        mockMvc.perform(post("/api/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.fullName").exists())
                .andExpect(jsonPath("$.errors.phone").exists())
                .andExpect(jsonPath("$.errors.email").exists());

        verify(clientService, never()).createClient(any(ClientCreateRequest.class));
    }

    @Test
    void getClientById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        ClientResponse response = new ClientResponse(
            id, "John Smith", "123456", "john@example.com", null, 
            Instant.now(), Instant.now(), TenantConstants.DEFAULT_STUDIO_ID
        );

        when(clientService.getClientById(id)).thenReturn(response);

        mockMvc.perform(get("/api/clients/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.studioId").value(TenantConstants.DEFAULT_STUDIO_ID.toString()))
                .andExpect(jsonPath("$.fullName").value("John Smith"));
    }

    @Test
    void getClientById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(clientService.getClientById(id)).thenThrow(new ResourceNotFoundException("Client not found"));

        mockMvc.perform(get("/api/clients/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void updateClient_Success() throws Exception {
        UUID id = UUID.randomUUID();
        ClientUpdateRequest request = new ClientUpdateRequest("John Updated", "654321", "updated@example.com", "Updated Notes");
        ClientResponse response = new ClientResponse(
            id, "John Updated", "654321", "updated@example.com", "Updated Notes", 
            Instant.now(), Instant.now(), TenantConstants.DEFAULT_STUDIO_ID
        );

        when(clientService.updateClient(eq(id), any(ClientUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/clients/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("John Updated"))
                .andExpect(jsonPath("$.phone").value("654321"))
                .andExpect(jsonPath("$.studioId").value(TenantConstants.DEFAULT_STUDIO_ID.toString()));
    }

    @Test
    void deleteClient_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(clientService).deleteClient(id);

        mockMvc.perform(delete("/api/clients/{id}", id))
                .andExpect(status().isNoContent());

        verify(clientService, times(1)).deleteClient(id);
    }
}
