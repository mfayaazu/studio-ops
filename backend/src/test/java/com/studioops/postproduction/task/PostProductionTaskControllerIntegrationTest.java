package com.studioops.postproduction.task;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.postproduction.task.dto.PostProductionTaskCreateRequest;
import com.studioops.postproduction.task.dto.PostProductionTaskMoveStatusRequest;
import com.studioops.postproduction.task.dto.PostProductionTaskResponse;
import com.studioops.postproduction.task.dto.PostProductionTaskUpdateRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PostProductionTaskController.class)
@Import(SecurityConfig.class)
class PostProductionTaskControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PostProductionTaskService postProductionTaskService;

    @Test
    void createTask_Success() throws Exception {
        UUID projectId = UUID.randomUUID();
        UUID deliverableId = UUID.randomUUID();

        PostProductionTaskCreateRequest request = new PostProductionTaskCreateRequest(
                projectId, deliverableId, "Photo Culling", "Cull 500 photos",
                PostProductionTaskType.PHOTO_CULLING, PostProductionTaskPriority.HIGH,
                PostProductionTaskStatus.TODO, null, LocalDate.of(2026, 6, 20),
                BigDecimal.valueOf(4.0), null, 0
        );

        PostProductionTaskResponse response = new PostProductionTaskResponse();
        response.setId(UUID.randomUUID());
        response.setStudioId(UUID.randomUUID());
        response.setProjectId(projectId);
        response.setDeliverableId(deliverableId);
        response.setTitle("Photo Culling");
        response.setTaskType(PostProductionTaskType.PHOTO_CULLING);
        response.setStatus(PostProductionTaskStatus.TODO);
        response.setPriority(PostProductionTaskPriority.HIGH);

        when(postProductionTaskService.createTask(any(PostProductionTaskCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/post-production-tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.title").value("Photo Culling"))
                .andExpect(jsonPath("$.taskType").value("PHOTO_CULLING"));
    }

    @Test
    void createTask_InvalidPayload_BadRequest() throws Exception {
        PostProductionTaskCreateRequest request = new PostProductionTaskCreateRequest();
        // Title and taskType and IDs are null/blank

        mockMvc.perform(post("/api/post-production-tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.projectId").exists())
                .andExpect(jsonPath("$.errors.deliverableId").exists())
                .andExpect(jsonPath("$.errors.title").exists())
                .andExpect(jsonPath("$.errors.taskType").exists());

        verify(postProductionTaskService, never()).createTask(any());
    }

    @Test
    void listTasks_Success() throws Exception {
        UUID projectId = UUID.randomUUID();
        PostProductionTaskResponse response = new PostProductionTaskResponse();
        response.setId(UUID.randomUUID());
        response.setTitle("Editing Process");
        response.setTaskType(PostProductionTaskType.PHOTO_EDITING);

        when(postProductionTaskService.listTasks(eq(projectId), any(), any(), any(), any(), any()))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/post-production-tasks")
                .param("projectId", projectId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].title").value("Editing Process"));
    }

    @Test
    void getTaskById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        PostProductionTaskResponse response = new PostProductionTaskResponse();
        response.setId(id);
        response.setTitle("Editing Process");

        when(postProductionTaskService.getTaskById(id)).thenReturn(response);

        mockMvc.perform(get("/api/post-production-tasks/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.title").value("Editing Process"));
    }

    @Test
    void getTaskById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(postProductionTaskService.getTaskById(id)).thenThrow(new ResourceNotFoundException("Task not found"));

        mockMvc.perform(get("/api/post-production-tasks/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateTask_Success() throws Exception {
        UUID id = UUID.randomUUID();
        PostProductionTaskUpdateRequest request = new PostProductionTaskUpdateRequest(
                "Updated Title", "Updated Desc", PostProductionTaskType.EXPORT_UPLOAD,
                PostProductionTaskPriority.LOW, PostProductionTaskStatus.DONE, null,
                LocalDate.of(2026, 6, 25), BigDecimal.valueOf(5.0), BigDecimal.valueOf(5.0), 0
        );

        PostProductionTaskResponse response = new PostProductionTaskResponse();
        response.setId(id);
        response.setTitle("Updated Title");
        response.setStatus(PostProductionTaskStatus.DONE);

        when(postProductionTaskService.updateTask(eq(id), any(PostProductionTaskUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/post-production-tasks/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.status").value("DONE"));
    }

    @Test
    void moveStatus_Success() throws Exception {
        UUID id = UUID.randomUUID();
        PostProductionTaskMoveStatusRequest request = new PostProductionTaskMoveStatusRequest(PostProductionTaskStatus.IN_REVIEW);

        PostProductionTaskResponse response = new PostProductionTaskResponse();
        response.setId(id);
        response.setStatus(PostProductionTaskStatus.IN_REVIEW);

        when(postProductionTaskService.moveStatus(eq(id), eq(PostProductionTaskStatus.IN_REVIEW))).thenReturn(response);

        mockMvc.perform(post("/api/post-production-tasks/{id}/move-status", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_REVIEW"));
    }

    @Test
    void deleteTask_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(postProductionTaskService).deleteTask(id);

        mockMvc.perform(delete("/api/post-production-tasks/{id}", id))
                .andExpect(status().isNoContent());

        verify(postProductionTaskService, times(1)).deleteTask(id);
    }
}
