package com.studioops.assignment;

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
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.studioops.assignment.dto.EventAssignmentCreateRequest;
import com.studioops.assignment.dto.EventAssignmentResponse;
import com.studioops.assignment.dto.EventAssignmentUpdateRequest;

@WebMvcTest(EventAssignmentController.class)
@Import(SecurityConfig.class)
class EventAssignmentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EventAssignmentService eventAssignmentService;

    @Test
    void createAssignment_Success() throws Exception {
        UUID eventId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();

        EventAssignmentCreateRequest request = new EventAssignmentCreateRequest();
        request.setEventId(eventId);
        request.setEmployeeId(employeeId);
        request.setAssignmentRole(AssignmentRole.CANDID_PHOTOGRAPHER);
        request.setAssignmentStatus(AssignmentStatus.PROPOSED);
        request.setCallTime(LocalTime.of(8, 30));
        request.setNotes("Notes here");

        EventAssignmentResponse response = new EventAssignmentResponse();
        response.setId(UUID.randomUUID());
        response.setEventId(eventId);
        response.setEmployeeId(employeeId);
        response.setAssignmentRole(AssignmentRole.CANDID_PHOTOGRAPHER);
        response.setAssignmentStatus(AssignmentStatus.PROPOSED);
        response.setCallTime(LocalTime.of(8, 30));
        response.setNotes("Notes here");
        response.setConflictWarning(true);
        response.setConflictReason("Conflict message");
        response.setCreatedAt(Instant.now());
        response.setUpdatedAt(Instant.now());

        when(eventAssignmentService.createAssignment(any(EventAssignmentCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.conflictWarning").value(true))
                .andExpect(jsonPath("$.conflictReason").value("Conflict message"))
                .andExpect(jsonPath("$.assignmentRole").value("CANDID_PHOTOGRAPHER"));
    }

    @Test
    void createAssignment_InvalidPayload_BadRequest() throws Exception {
        EventAssignmentCreateRequest request = new EventAssignmentCreateRequest();

        mockMvc.perform(post("/api/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.eventId").exists())
                .andExpect(jsonPath("$.errors.employeeId").exists())
                .andExpect(jsonPath("$.errors.assignmentRole").exists())
                .andExpect(jsonPath("$.errors.assignmentStatus").exists());

        verify(eventAssignmentService, never()).createAssignment(any(EventAssignmentCreateRequest.class));
    }

    @Test
    void getAssignmentById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();

        EventAssignmentResponse response = new EventAssignmentResponse();
        response.setId(id);
        response.setEventId(eventId);
        response.setEmployeeId(employeeId);
        response.setAssignmentRole(AssignmentRole.CANDID_PHOTOGRAPHER);
        response.setAssignmentStatus(AssignmentStatus.ACCEPTED);

        when(eventAssignmentService.getAssignmentById(id)).thenReturn(response);

        mockMvc.perform(get("/api/assignments/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.assignmentStatus").value("ACCEPTED"));
    }

    @Test
    void getAssignmentById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(eventAssignmentService.getAssignmentById(id))
                .thenThrow(new ResourceNotFoundException("Assignment not found"));

        mockMvc.perform(get("/api/assignments/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void listAssignments_Success() throws Exception {
        UUID eventId = UUID.randomUUID();
        EventAssignmentResponse response = new EventAssignmentResponse();
        response.setId(UUID.randomUUID());
        response.setEventId(eventId);
        response.setAssignmentRole(AssignmentRole.DRONE_OPERATOR);

        when(eventAssignmentService.listAssignments(eq(eventId), any())).thenReturn(List.of(response));

        mockMvc.perform(get("/api/assignments")
                        .param("eventId", eventId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventId").value(eventId.toString()))
                .andExpect(jsonPath("$[0].assignmentRole").value("DRONE_OPERATOR"));
    }

    @Test
    void updateAssignment_Success() throws Exception {
        UUID id = UUID.randomUUID();
        EventAssignmentUpdateRequest request = new EventAssignmentUpdateRequest();
        request.setAssignmentRole(AssignmentRole.CINEMATOGRAPHER);
        request.setAssignmentStatus(AssignmentStatus.ACCEPTED);

        EventAssignmentResponse response = new EventAssignmentResponse();
        response.setId(id);
        response.setAssignmentRole(AssignmentRole.CINEMATOGRAPHER);
        response.setAssignmentStatus(AssignmentStatus.ACCEPTED);

        when(eventAssignmentService.updateAssignment(eq(id), any(EventAssignmentUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/assignments/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignmentRole").value("CINEMATOGRAPHER"))
                .andExpect(jsonPath("$.assignmentStatus").value("ACCEPTED"));
    }

    @Test
    void deleteAssignment_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(eventAssignmentService).deleteAssignment(id);

        mockMvc.perform(delete("/api/assignments/{id}", id))
                .andExpect(status().isNoContent());

        verify(eventAssignmentService, times(1)).deleteAssignment(id);
    }
}
