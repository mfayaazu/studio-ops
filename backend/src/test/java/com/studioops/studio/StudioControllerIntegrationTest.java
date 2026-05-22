package com.studioops.studio;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.studio.dto.StudioCreateRequest;
import com.studioops.studio.dto.StudioResponse;
import com.studioops.studio.dto.StudioUpdateRequest;
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

@WebMvcTest(StudioController.class)
@Import(SecurityConfig.class)
class StudioControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StudioService studioService;

    @Test
    void createStudio_Success() throws Exception {
        StudioCreateRequest request = new StudioCreateRequest(
                "Nordic Light Studios",
                "nordic-light",
                "info@nordiclight.se",
                "+46700000000",
                "Sweden",
                "Europe/Stockholm"
        );
        StudioResponse response = new StudioResponse(
                UUID.randomUUID(),
                "Nordic Light Studios",
                "nordic-light",
                "info@nordiclight.se",
                "+46700000000",
                "Sweden",
                "Europe/Stockholm",
                StudioStatus.ACTIVE,
                SubscriptionPlan.STARTER,
                SubscriptionStatus.TRIAL,
                Instant.now(),
                Instant.now()
        );

        when(studioService.createStudio(any(StudioCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/studios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.name").value("Nordic Light Studios"))
                .andExpect(jsonPath("$.slug").value("nordic-light"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.subscriptionPlan").value("STARTER"));
    }

    @Test
    void createStudio_InvalidPayload_BadRequest() throws Exception {
        StudioCreateRequest request = new StudioCreateRequest(
                "", // Blank name
                "", // Blank slug
                "invalid-email",
                null, null, null
        );

        mockMvc.perform(post("/api/studios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.slug").exists())
                .andExpect(jsonPath("$.errors.businessEmail").exists());

        verify(studioService, never()).createStudio(any(StudioCreateRequest.class));
    }

    @Test
    void getStudioById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        StudioResponse response = new StudioResponse(
                id,
                "Nordic Light Studios",
                "nordic-light",
                "info@nordiclight.se",
                null, null,
                "Europe/Stockholm",
                StudioStatus.ACTIVE,
                SubscriptionPlan.STARTER,
                SubscriptionStatus.TRIAL,
                Instant.now(),
                Instant.now()
        );

        when(studioService.getStudioById(id)).thenReturn(response);

        mockMvc.perform(get("/api/studios/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Nordic Light Studios"));
    }

    @Test
    void getStudioById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(studioService.getStudioById(id)).thenThrow(new ResourceNotFoundException("Studio not found"));

        mockMvc.perform(get("/api/studios/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void updateStudio_Success() throws Exception {
        UUID id = UUID.randomUUID();
        StudioUpdateRequest request = new StudioUpdateRequest(
                "Updated Name",
                "updated-slug",
                "updated@example.com",
                "123456",
                "Norway",
                "Europe/Oslo",
                StudioStatus.SUSPENDED,
                SubscriptionPlan.PRO,
                SubscriptionStatus.ACTIVE
        );
        StudioResponse response = new StudioResponse(
                id,
                "Updated Name",
                "updated-slug",
                "updated@example.com",
                "123456",
                "Norway",
                "Europe/Oslo",
                StudioStatus.SUSPENDED,
                SubscriptionPlan.PRO,
                SubscriptionStatus.ACTIVE,
                Instant.now(),
                Instant.now()
        );

        when(studioService.updateStudio(eq(id), any(StudioUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/studios/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.slug").value("updated-slug"))
                .andExpect(jsonPath("$.status").value("SUSPENDED"))
                .andExpect(jsonPath("$.subscriptionPlan").value("PRO"));
    }

    @Test
    void deleteStudio_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(studioService).deleteStudio(id);

        mockMvc.perform(delete("/api/studios/{id}", id))
                .andExpect(status().isNoContent());

        verify(studioService, times(1)).deleteStudio(id);
    }

    @Test
    void listStudios_Success() throws Exception {
        StudioResponse studioResponse = new StudioResponse(
                UUID.randomUUID(),
                "Nordic Light Studios",
                "nordic-light",
                "info@nordiclight.se",
                null, null,
                "Europe/Stockholm",
                StudioStatus.ACTIVE,
                SubscriptionPlan.STARTER,
                SubscriptionStatus.TRIAL,
                Instant.now(),
                Instant.now()
        );

        when(studioService.listStudios(any())).thenReturn(Collections.singletonList(studioResponse));

        mockMvc.perform(get("/api/studios?search=Nordic"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Nordic Light Studios"));
    }
}
