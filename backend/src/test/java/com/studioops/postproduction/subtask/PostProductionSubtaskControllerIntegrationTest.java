package com.studioops.postproduction.subtask;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskCreateRequest;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskMoveStatusRequest;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskResponse;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskUpdateRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PostProductionSubtaskController.class)
@Import(SecurityConfig.class)
class PostProductionSubtaskControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PostProductionSubtaskService postProductionSubtaskService;

    @Test
    void createSubtask_Success() throws Exception {
        UUID taskId = UUID.randomUUID();

        PostProductionSubtaskCreateRequest request = new PostProductionSubtaskCreateRequest(
                taskId, "Subtask 1", "Subtask desc", PostProductionSubtaskStatus.TODO, null, 0
        );

        PostProductionSubtaskResponse response = new PostProductionSubtaskResponse();
        response.setId(UUID.randomUUID());
        response.setTaskId(taskId);
        response.setTitle("Subtask 1");
        response.setStatus(PostProductionSubtaskStatus.TODO);

        when(postProductionSubtaskService.createSubtask(any(PostProductionSubtaskCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/post-production-subtasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.title").value("Subtask 1"));
    }

    @Test
    void createSubtask_InvalidPayload_BadRequest() throws Exception {
        PostProductionSubtaskCreateRequest request = new PostProductionSubtaskCreateRequest();
        // Missing taskId and title

        mockMvc.perform(post("/api/post-production-subtasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.taskId").exists())
                .andExpect(jsonPath("$.errors.title").exists());

        verify(postProductionSubtaskService, never()).createSubtask(any());
    }

    @Test
    void listSubtasks_Success() throws Exception {
        UUID taskId = UUID.randomUUID();
        PostProductionSubtaskResponse response = new PostProductionSubtaskResponse();
        response.setId(UUID.randomUUID());
        response.setTitle("Subtask list");

        when(postProductionSubtaskService.listSubtasks(eq(taskId), any(), any()))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/post-production-subtasks")
                .param("taskId", taskId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].title").value("Subtask list"));
    }

    @Test
    void getSubtaskById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        PostProductionSubtaskResponse response = new PostProductionSubtaskResponse();
        response.setId(id);
        response.setTitle("Detail subtask");

        when(postProductionSubtaskService.getSubtaskById(id)).thenReturn(response);

        mockMvc.perform(get("/api/post-production-subtasks/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.title").value("Detail subtask"));
    }

    @Test
    void getSubtaskById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(postProductionSubtaskService.getSubtaskById(id)).thenThrow(new ResourceNotFoundException("Subtask not found"));

        mockMvc.perform(get("/api/post-production-subtasks/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateSubtask_Success() throws Exception {
        UUID id = UUID.randomUUID();
        PostProductionSubtaskUpdateRequest request = new PostProductionSubtaskUpdateRequest(
                "Updated title", "Updated desc", PostProductionSubtaskStatus.DONE, null, 1
        );

        PostProductionSubtaskResponse response = new PostProductionSubtaskResponse();
        response.setId(id);
        response.setTitle("Updated title");
        response.setStatus(PostProductionSubtaskStatus.DONE);

        when(postProductionSubtaskService.updateSubtask(eq(id), any(PostProductionSubtaskUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/post-production-subtasks/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated title"))
                .andExpect(jsonPath("$.status").value("DONE"));
    }

    @Test
    void moveStatus_Success() throws Exception {
        UUID id = UUID.randomUUID();
        PostProductionSubtaskMoveStatusRequest request = new PostProductionSubtaskMoveStatusRequest(PostProductionSubtaskStatus.DONE);

        PostProductionSubtaskResponse response = new PostProductionSubtaskResponse();
        response.setId(id);
        response.setStatus(PostProductionSubtaskStatus.DONE);

        when(postProductionSubtaskService.moveStatus(eq(id), eq(PostProductionSubtaskStatus.DONE))).thenReturn(response);

        mockMvc.perform(post("/api/post-production-subtasks/{id}/move-status", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"));
    }

    @Test
    void deleteSubtask_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(postProductionSubtaskService).deleteSubtask(id);

        mockMvc.perform(delete("/api/post-production-subtasks/{id}", id))
                .andExpect(status().isNoContent());

        verify(postProductionSubtaskService, times(1)).deleteSubtask(id);
    }
}
