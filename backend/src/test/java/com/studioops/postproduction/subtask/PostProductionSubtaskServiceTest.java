package com.studioops.postproduction.subtask;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.employee.Employee;
import com.studioops.employee.EmployeeRepository;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskCreateRequest;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskResponse;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskUpdateRequest;
import com.studioops.postproduction.task.PostProductionTask;
import com.studioops.postproduction.task.PostProductionTaskRepository;
import com.studioops.studio.StudioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PostProductionSubtaskServiceTest {

    @Mock
    private PostProductionSubtaskRepository postProductionSubtaskRepository;

    @Mock
    private PostProductionTaskRepository postProductionTaskRepository;

    @Mock
    private StudioRepository studioRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private PostProductionSubtaskService postProductionSubtaskService;

    private UUID taskId;
    private PostProductionTask parentTask;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        taskId = UUID.randomUUID();
        parentTask = new PostProductionTask();
        parentTask.setId(taskId);
        parentTask.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        lenient().when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
    }

    @Test
    void createSubtask_DefaultsStatusToTodoAndSortOrderToZero() {
        PostProductionSubtaskCreateRequest request = new PostProductionSubtaskCreateRequest();
        request.setTaskId(taskId);
        request.setTitle("Subtask 1");
        request.setStatus(null);
        request.setSortOrder(null);

        when(postProductionTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(parentTask));

        PostProductionSubtask subtask = new PostProductionSubtask();
        subtask.setId(UUID.randomUUID());
        subtask.setTaskId(taskId);
        subtask.setTitle("Subtask 1");
        subtask.setStatus(PostProductionSubtaskStatus.TODO);
        subtask.setSortOrder(0);
        subtask.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(postProductionSubtaskRepository.save(any(PostProductionSubtask.class))).thenReturn(subtask);

        PostProductionSubtaskResponse response = postProductionSubtaskService.createSubtask(request);

        assertNotNull(response);
        assertEquals(PostProductionSubtaskStatus.TODO, response.getStatus());
        assertEquals(0, response.getSortOrder());
        verify(postProductionSubtaskRepository, times(1)).save(any(PostProductionSubtask.class));
    }

    @Test
    void createSubtask_ThrowsException_WhenTaskNotFoundInStudio() {
        PostProductionSubtaskCreateRequest request = new PostProductionSubtaskCreateRequest();
        request.setTaskId(taskId);
        request.setTitle("Subtask 1");

        when(postProductionTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> postProductionSubtaskService.createSubtask(request));
        verify(postProductionSubtaskRepository, never()).save(any(PostProductionSubtask.class));
    }

    @Test
    void createSubtask_ThrowsException_WhenAssignedEmployeeNotInStudio() {
        UUID employeeId = UUID.randomUUID();
        PostProductionSubtaskCreateRequest request = new PostProductionSubtaskCreateRequest();
        request.setTaskId(taskId);
        request.setTitle("Subtask 1");
        request.setAssignedEmployeeId(employeeId);

        when(postProductionTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(parentTask));
        when(employeeRepository.findByIdAndStudioId(employeeId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> postProductionSubtaskService.createSubtask(request));
        verify(postProductionSubtaskRepository, never()).save(any(PostProductionSubtask.class));
    }

    @Test
    void createSubtask_WithDoneSetsCompletedAt() {
        PostProductionSubtaskCreateRequest request = new PostProductionSubtaskCreateRequest();
        request.setTaskId(taskId);
        request.setTitle("Subtask 1");
        request.setStatus(PostProductionSubtaskStatus.DONE);

        when(postProductionTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(parentTask));

        PostProductionSubtask subtask = new PostProductionSubtask();
        subtask.setId(UUID.randomUUID());
        subtask.setTaskId(taskId);
        subtask.setTitle("Subtask 1");
        subtask.setStatus(PostProductionSubtaskStatus.DONE);
        subtask.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(postProductionSubtaskRepository.save(any(PostProductionSubtask.class))).thenReturn(subtask);

        PostProductionSubtaskResponse response = postProductionSubtaskService.createSubtask(request);

        assertNotNull(response);
        assertEquals(PostProductionSubtaskStatus.DONE, response.getStatus());
        assertNotNull(response.getCompletedAt());
    }

    @Test
    void moveStatus_ToDoneSetsCompletedAt() {
        UUID subtaskId = UUID.randomUUID();
        PostProductionSubtask subtask = new PostProductionSubtask();
        subtask.setId(subtaskId);
        subtask.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        subtask.setStatus(PostProductionSubtaskStatus.TODO);

        when(postProductionSubtaskRepository.findByIdAndStudioId(subtaskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(subtask));
        when(postProductionSubtaskRepository.save(any(PostProductionSubtask.class))).thenReturn(subtask);

        PostProductionSubtaskResponse response = postProductionSubtaskService.moveStatus(subtaskId, PostProductionSubtaskStatus.DONE);

        assertNotNull(response);
        assertEquals(PostProductionSubtaskStatus.DONE, response.getStatus());
        assertNotNull(response.getCompletedAt());
    }

    @Test
    void moveStatus_AwayFromDoneClearsCompletedAt() {
        UUID subtaskId = UUID.randomUUID();
        PostProductionSubtask subtask = new PostProductionSubtask();
        subtask.setId(subtaskId);
        subtask.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        subtask.setStatus(PostProductionSubtaskStatus.DONE);

        when(postProductionSubtaskRepository.findByIdAndStudioId(subtaskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(subtask));
        when(postProductionSubtaskRepository.save(any(PostProductionSubtask.class))).thenReturn(subtask);

        PostProductionSubtaskResponse response = postProductionSubtaskService.moveStatus(subtaskId, PostProductionSubtaskStatus.IN_PROGRESS);

        assertNotNull(response);
        assertEquals(PostProductionSubtaskStatus.IN_PROGRESS, response.getStatus());
        assertNull(response.getCompletedAt());
    }

    @Test
    void listSubtasks_AppliesFiltersCorrectly() {
        PostProductionSubtask subtask = new PostProductionSubtask();
        subtask.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        subtask.setTaskId(taskId);

        when(postProductionSubtaskRepository.filterSubtasks(eq(TenantConstants.DEFAULT_STUDIO_ID), eq(taskId), any(), any()))
                .thenReturn(List.of(subtask));

        List<PostProductionSubtaskResponse> results = postProductionSubtaskService.listSubtasks(
                taskId, null, null);

        assertEquals(1, results.size());
        verify(postProductionSubtaskRepository, times(1)).filterSubtasks(
                eq(TenantConstants.DEFAULT_STUDIO_ID), eq(taskId), any(), any());
    }

    @Test
    void updateSubtask_Succeeds_WithValidData() {
        UUID subtaskId = UUID.randomUUID();
        PostProductionSubtask subtask = new PostProductionSubtask();
        subtask.setId(subtaskId);
        subtask.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        PostProductionSubtaskUpdateRequest request = new PostProductionSubtaskUpdateRequest(
                "Updated Title", "Updated Desc", PostProductionSubtaskStatus.DONE, null, 1
        );

        when(postProductionSubtaskRepository.findByIdAndStudioId(subtaskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(subtask));
        when(postProductionSubtaskRepository.save(any(PostProductionSubtask.class))).thenReturn(subtask);

        PostProductionSubtaskResponse response = postProductionSubtaskService.updateSubtask(subtaskId, request);

        assertNotNull(response);
        assertEquals("Updated Title", response.getTitle());
        assertEquals("Updated Desc", response.getDescription());
        assertEquals(PostProductionSubtaskStatus.DONE, response.getStatus());
        assertNotNull(response.getCompletedAt());
    }

    @Test
    void getSubtaskById_ThrowsException_WhenNotFound() {
        UUID subtaskId = UUID.randomUUID();
        when(postProductionSubtaskRepository.findByIdAndStudioId(subtaskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> postProductionSubtaskService.getSubtaskById(subtaskId));
    }

    @Test
    void deleteSubtask_Succeeds() {
        UUID subtaskId = UUID.randomUUID();
        PostProductionSubtask subtask = new PostProductionSubtask();
        subtask.setId(subtaskId);
        subtask.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(postProductionSubtaskRepository.findByIdAndStudioId(subtaskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(subtask));
        doNothing().when(postProductionSubtaskRepository).delete(subtask);

        assertDoesNotThrow(() -> postProductionSubtaskService.deleteSubtask(subtaskId));
        verify(postProductionSubtaskRepository, times(1)).delete(subtask);
    }
}
