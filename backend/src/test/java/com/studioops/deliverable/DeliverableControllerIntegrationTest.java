package com.studioops.deliverable;

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
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.studioops.deliverable.dto.DeliverableCreateRequest;
import com.studioops.deliverable.dto.DeliverableResponse;
import com.studioops.deliverable.dto.DeliverableUpdateRequest;

@WebMvcTest(DeliverableController.class)
@Import(SecurityConfig.class)
class DeliverableControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DeliverableService deliverableService;

    @Test
    void createDeliverable_Success() throws Exception {
        UUID projectId = UUID.randomUUID();
        DeliverableCreateRequest request = new DeliverableCreateRequest(
                projectId, "Edited Photos", DeliverableType.PHOTOS, DeliverableStatus.NOT_STARTED,
                "s3://bucket/photos.zip", LocalDate.of(2026, 6, 20)
        );

        UUID studioId = UUID.randomUUID();
        DeliverableResponse response = new DeliverableResponse();
        response.setId(UUID.randomUUID());
        response.setProjectId(projectId);
        response.setStudioId(studioId);
        response.setName("Edited Photos");
        response.setDeliverableType(DeliverableType.PHOTOS);
        response.setStatus(DeliverableStatus.NOT_STARTED);
        response.setReferenceUrl("s3://bucket/photos.zip");
        response.setDueDate(LocalDate.of(2026, 6, 20));
        response.setCreatedAt(Instant.now());
        response.setUpdatedAt(Instant.now());

        when(deliverableService.createDeliverable(any(DeliverableCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/deliverables")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.studioId").value(studioId.toString()))
                .andExpect(jsonPath("$.name").value("Edited Photos"))
                .andExpect(jsonPath("$.deliverableType").value("PHOTOS"));
    }

    @Test
    void createDeliverable_InvalidPayload_BadRequest() throws Exception {
        DeliverableCreateRequest request = new DeliverableCreateRequest(
                null, "", null, null, null, null
        );

        mockMvc.perform(post("/api/deliverables")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.projectId").exists())
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.deliverableType").exists())
                .andExpect(jsonPath("$.errors.status").exists());

        verify(deliverableService, never()).createDeliverable(any(DeliverableCreateRequest.class));
    }

    @Test
    void listDeliverables_Success() throws Exception {
        UUID projectId = UUID.randomUUID();
        UUID studioId = UUID.randomUUID();
        DeliverableResponse response = new DeliverableResponse();
        response.setId(UUID.randomUUID());
        response.setProjectId(projectId);
        response.setStudioId(studioId);
        response.setName("Album Design");
        response.setDeliverableType(DeliverableType.ALBUM_DESIGN);
        response.setStatus(DeliverableStatus.IN_PROGRESS);

        when(deliverableService.listDeliverables(projectId)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/deliverables")
                .param("projectId", projectId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].name").value("Album Design"))
                .andExpect(jsonPath("$[0].studioId").value(studioId.toString()));
    }

    @Test
    void getDeliverableById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        UUID studioId = UUID.randomUUID();
        DeliverableResponse response = new DeliverableResponse();
        response.setId(id);
        response.setProjectId(UUID.randomUUID());
        response.setStudioId(studioId);
        response.setName("Full Video");
        response.setDeliverableType(DeliverableType.FULL_VIDEO);
        response.setStatus(DeliverableStatus.DELIVERED);

        when(deliverableService.getDeliverableById(id)).thenReturn(response);

        mockMvc.perform(get("/api/deliverables/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.studioId").value(studioId.toString()))
                .andExpect(jsonPath("$.name").value("Full Video"));
    }

    @Test
    void getDeliverableById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(deliverableService.getDeliverableById(id)).thenThrow(new ResourceNotFoundException("Deliverable not found"));

        mockMvc.perform(get("/api/deliverables/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateDeliverable_Success() throws Exception {
        UUID id = UUID.randomUUID();
        UUID studioId = UUID.randomUUID();
        DeliverableUpdateRequest request = new DeliverableUpdateRequest(
                "Updated Name", DeliverableType.PHOTOS, DeliverableStatus.READY_FOR_REVIEW,
                "s3://bucket/photos_v2.zip", LocalDate.of(2026, 6, 25)
        );

        DeliverableResponse response = new DeliverableResponse();
        response.setId(id);
        response.setProjectId(UUID.randomUUID());
        response.setStudioId(studioId);
        response.setName("Updated Name");
        response.setDeliverableType(DeliverableType.PHOTOS);
        response.setStatus(DeliverableStatus.READY_FOR_REVIEW);

        when(deliverableService.updateDeliverable(eq(id), any(DeliverableUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/deliverables/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studioId").value(studioId.toString()))
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.status").value("READY_FOR_REVIEW"));
    }

    @Test
    void deleteDeliverable_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(deliverableService).deleteDeliverable(id);

        mockMvc.perform(delete("/api/deliverables/{id}", id))
                .andExpect(status().isNoContent());

        verify(deliverableService, times(1)).deleteDeliverable(id);
    }
}
