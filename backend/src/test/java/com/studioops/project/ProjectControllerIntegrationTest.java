package com.studioops.project;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.project.dto.ProjectCreateRequest;
import com.studioops.project.dto.ProjectResponse;
import com.studioops.project.dto.ProjectUpdateRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProjectController.class)
@Import(SecurityConfig.class)
class ProjectControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProjectService projectService;

    @Test
    void createProject_Success() throws Exception {
        UUID clientId = UUID.randomUUID();
        UUID managerId = UUID.randomUUID();
        ProjectCreateRequest request = new ProjectCreateRequest(
                clientId, managerId, "RSA-2026-0001", "Corp Portrait", "Corporate",
                BookingStatus.INQUIRY, PaymentStatus.UNPAID, ProjectStatus.LEAD,
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 15), "Notes here"
        );
        ProjectResponse response = new ProjectResponse(
                UUID.randomUUID(), clientId, managerId, "RSA-2026-0001", "Corp Portrait", "Corporate",
                BookingStatus.INQUIRY, PaymentStatus.UNPAID, ProjectStatus.LEAD,
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 15), "Notes here",
                Instant.now(), Instant.now()
        );

        when(projectService.createProject(any(ProjectCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.projectCode").value("RSA-2026-0001"))
                .andExpect(jsonPath("$.title").value("Corp Portrait"));
    }

    @Test
    void createProject_InvalidPayload_BadRequest() throws Exception {
        ProjectCreateRequest request = new ProjectCreateRequest(
                null, null, "", "", "",
                null, null, null, null, null, null
        );

        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.clientId").exists())
                .andExpect(jsonPath("$.errors.projectCode").exists())
                .andExpect(jsonPath("$.errors.title").exists())
                .andExpect(jsonPath("$.errors.projectType").exists());

        verify(projectService, never()).createProject(any(ProjectCreateRequest.class));
    }

    @Test
    void getProjectById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        ProjectResponse response = new ProjectResponse(
                id, clientId, null, "RSA-2026-0001", "Corp Portrait", "Corporate",
                BookingStatus.INQUIRY, PaymentStatus.UNPAID, ProjectStatus.LEAD,
                null, null, null, Instant.now(), Instant.now()
        );

        when(projectService.getProjectById(id)).thenReturn(response);

        mockMvc.perform(get("/api/projects/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.projectCode").value("RSA-2026-0001"));
    }

    @Test
    void getProjectById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(projectService.getProjectById(id)).thenThrow(new ResourceNotFoundException("Project not found"));

        mockMvc.perform(get("/api/projects/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void updateProject_Success() throws Exception {
        UUID id = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        ProjectUpdateRequest request = new ProjectUpdateRequest(
                clientId, null, "RSA-2026-0002", "Corp Portrait Updated", "Corporate",
                BookingStatus.FULLY_BOOKED, PaymentStatus.FULLY_PAID, ProjectStatus.CONFIRMED,
                null, null, null
        );
        ProjectResponse response = new ProjectResponse(
                id, clientId, null, "RSA-2026-0002", "Corp Portrait Updated", "Corporate",
                BookingStatus.FULLY_BOOKED, PaymentStatus.FULLY_PAID, ProjectStatus.CONFIRMED,
                null, null, null, Instant.now(), Instant.now()
        );

        when(projectService.updateProject(eq(id), any(ProjectUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/projects/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectCode").value("RSA-2026-0002"))
                .andExpect(jsonPath("$.title").value("Corp Portrait Updated"));
    }

    @Test
    void deleteProject_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(projectService).deleteProject(id);

        mockMvc.perform(delete("/api/projects/{id}", id))
                .andExpect(status().isNoContent());

        verify(projectService, times(1)).deleteProject(id);
    }
}
