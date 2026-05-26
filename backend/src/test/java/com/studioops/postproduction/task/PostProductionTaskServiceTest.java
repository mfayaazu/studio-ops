package com.studioops.postproduction.task;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.deliverable.Deliverable;
import com.studioops.deliverable.DeliverableRepository;
import com.studioops.employee.Employee;
import com.studioops.employee.EmployeeRepository;
import com.studioops.postproduction.task.dto.PostProductionTaskCreateRequest;
import com.studioops.postproduction.task.dto.PostProductionTaskResponse;
import com.studioops.postproduction.task.dto.PostProductionTaskUpdateRequest;
import com.studioops.project.Project;
import com.studioops.project.ProjectRepository;
import com.studioops.studio.StudioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PostProductionTaskServiceTest {

    @Mock
    private PostProductionTaskRepository postProductionTaskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private DeliverableRepository deliverableRepository;

    @Mock
    private StudioRepository studioRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private PostProductionTaskService postProductionTaskService;

    private UUID projectId;
    private UUID deliverableId;
    private Project project;
    private Deliverable deliverable;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        projectId = UUID.randomUUID();
        deliverableId = UUID.randomUUID();

        project = new Project();
        project.setId(projectId);
        project.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        deliverable = new Deliverable();
        deliverable.setId(deliverableId);
        deliverable.setProjectId(projectId);
        deliverable.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        lenient().when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
    }

    @Test
    void createTask_DefaultsPriorityAndStatus_WhenMissing() {
        PostProductionTaskCreateRequest request = new PostProductionTaskCreateRequest();
        request.setProjectId(projectId);
        request.setDeliverableId(deliverableId);
        request.setTitle("Photo Culling for Wedding");
        request.setTaskType(PostProductionTaskType.PHOTO_CULLING);
        request.setPriority(null);
        request.setStatus(null);

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));
        when(deliverableRepository.findByIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(deliverable));

        PostProductionTask task = new PostProductionTask();
        task.setId(UUID.randomUUID());
        task.setProjectId(projectId);
        task.setDeliverableId(deliverableId);
        task.setTitle("Photo Culling for Wedding");
        task.setTaskType(PostProductionTaskType.PHOTO_CULLING);
        task.setPriority(PostProductionTaskPriority.MEDIUM);
        task.setStatus(PostProductionTaskStatus.TODO);
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(postProductionTaskRepository.save(any(PostProductionTask.class))).thenReturn(task);

        PostProductionTaskResponse response = postProductionTaskService.createTask(request);

        assertNotNull(response);
        assertEquals(PostProductionTaskPriority.MEDIUM, response.getPriority());
        assertEquals(PostProductionTaskStatus.TODO, response.getStatus());
        verify(postProductionTaskRepository, times(1)).save(any(PostProductionTask.class));
    }

    @Test
    void createTask_ThrowsException_WhenProjectNotFoundInStudio() {
        PostProductionTaskCreateRequest request = new PostProductionTaskCreateRequest();
        request.setProjectId(projectId);
        request.setDeliverableId(deliverableId);
        request.setTitle("Photo Culling for Wedding");
        request.setTaskType(PostProductionTaskType.PHOTO_CULLING);

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> postProductionTaskService.createTask(request));
        verify(postProductionTaskRepository, never()).save(any(PostProductionTask.class));
    }

    @Test
    void createTask_ThrowsException_WhenDeliverableNotFoundInStudio() {
        PostProductionTaskCreateRequest request = new PostProductionTaskCreateRequest();
        request.setProjectId(projectId);
        request.setDeliverableId(deliverableId);
        request.setTitle("Photo Culling for Wedding");
        request.setTaskType(PostProductionTaskType.PHOTO_CULLING);

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));
        when(deliverableRepository.findByIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> postProductionTaskService.createTask(request));
        verify(postProductionTaskRepository, never()).save(any(PostProductionTask.class));
    }

    @Test
    void createTask_ThrowsException_WhenDeliverableProjectMismatch() {
        PostProductionTaskCreateRequest request = new PostProductionTaskCreateRequest();
        request.setProjectId(projectId);
        request.setDeliverableId(deliverableId);
        request.setTitle("Photo Culling for Wedding");
        request.setTaskType(PostProductionTaskType.PHOTO_CULLING);

        Deliverable mismatchedDeliverable = new Deliverable();
        mismatchedDeliverable.setId(deliverableId);
        mismatchedDeliverable.setProjectId(UUID.randomUUID());
        mismatchedDeliverable.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));
        when(deliverableRepository.findByIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(mismatchedDeliverable));

        assertThrows(IllegalArgumentException.class, () -> postProductionTaskService.createTask(request));
        verify(postProductionTaskRepository, never()).save(any(PostProductionTask.class));
    }

    @Test
    void createTask_ThrowsException_WhenAssignedEmployeeNotInStudio() {
        UUID employeeId = UUID.randomUUID();
        PostProductionTaskCreateRequest request = new PostProductionTaskCreateRequest();
        request.setProjectId(projectId);
        request.setDeliverableId(deliverableId);
        request.setTitle("Photo Culling for Wedding");
        request.setTaskType(PostProductionTaskType.PHOTO_CULLING);
        request.setAssignedEmployeeId(employeeId);

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));
        when(deliverableRepository.findByIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(deliverable));
        when(employeeRepository.findByIdAndStudioId(employeeId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> postProductionTaskService.createTask(request));
        verify(postProductionTaskRepository, never()).save(any(PostProductionTask.class));
    }

    @Test
    void createTask_Succeeds_WhenEmployeeInSameStudio() {
        UUID employeeId = UUID.randomUUID();
        PostProductionTaskCreateRequest request = new PostProductionTaskCreateRequest();
        request.setProjectId(projectId);
        request.setDeliverableId(deliverableId);
        request.setTitle("Photo Culling for Wedding");
        request.setTaskType(PostProductionTaskType.PHOTO_CULLING);
        request.setAssignedEmployeeId(employeeId);

        Employee employee = new Employee();
        employee.setId(employeeId);
        employee.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));
        when(deliverableRepository.findByIdAndStudioId(deliverableId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(deliverable));
        when(employeeRepository.findByIdAndStudioId(employeeId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(employee));

        PostProductionTask task = new PostProductionTask();
        task.setId(UUID.randomUUID());
        task.setProjectId(projectId);
        task.setDeliverableId(deliverableId);
        task.setTitle("Photo Culling for Wedding");
        task.setTaskType(PostProductionTaskType.PHOTO_CULLING);
        task.setAssignedEmployeeId(employeeId);
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(postProductionTaskRepository.save(any(PostProductionTask.class))).thenReturn(task);

        PostProductionTaskResponse response = postProductionTaskService.createTask(request);

        assertNotNull(response);
        assertEquals(employeeId, response.getAssignedEmployeeId());
    }

    @Test
    void listTasks_AppliesFiltersCorrectly() {
        PostProductionTask task = new PostProductionTask();
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        task.setProjectId(projectId);

        when(postProductionTaskRepository.filterTasks(
                eq(TenantConstants.DEFAULT_STUDIO_ID), eq(projectId), any(), any(), any(), any(), eq("%search%")))
                .thenReturn(List.of(task));

        List<PostProductionTaskResponse> results = postProductionTaskService.listTasks(
                projectId, null, null, null, null, "search");

        assertEquals(1, results.size());
        verify(postProductionTaskRepository, times(1)).filterTasks(
                eq(TenantConstants.DEFAULT_STUDIO_ID), eq(projectId), any(), any(), any(), any(), eq("%search%"));
    }

    @Test
    void getTaskById_Succeeds_WhenFound() {
        UUID taskId = UUID.randomUUID();
        PostProductionTask task = new PostProductionTask();
        task.setId(taskId);
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(postProductionTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(task));

        PostProductionTaskResponse response = postProductionTaskService.getTaskById(taskId);

        assertNotNull(response);
        assertEquals(taskId, response.getId());
    }

    @Test
    void getTaskById_ThrowsException_WhenNotFound() {
        UUID taskId = UUID.randomUUID();
        when(postProductionTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> postProductionTaskService.getTaskById(taskId));
    }

    @Test
    void updateTask_Succeeds_WithValidData() {
        UUID taskId = UUID.randomUUID();
        PostProductionTask task = new PostProductionTask();
        task.setId(taskId);
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        PostProductionTaskUpdateRequest request = new PostProductionTaskUpdateRequest(
                "New Title", "New Description", PostProductionTaskType.COLOR_GRADING,
                PostProductionTaskPriority.URGENT, PostProductionTaskStatus.IN_PROGRESS,
                null, LocalDate.now(), BigDecimal.valueOf(10.0), BigDecimal.valueOf(2.5), 1
        );

        when(postProductionTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(task));
        when(postProductionTaskRepository.save(any(PostProductionTask.class))).thenReturn(task);

        PostProductionTaskResponse response = postProductionTaskService.updateTask(taskId, request);

        assertNotNull(response);
        assertEquals("New Title", response.getTitle());
        assertEquals("New Description", response.getDescription());
        assertEquals(PostProductionTaskStatus.IN_PROGRESS, response.getStatus());
        assertEquals(PostProductionTaskPriority.URGENT, response.getPriority());
    }

    @Test
    void moveStatus_Succeeds() {
        UUID taskId = UUID.randomUUID();
        PostProductionTask task = new PostProductionTask();
        task.setId(taskId);
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        task.setStatus(PostProductionTaskStatus.TODO);

        when(postProductionTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(task));
        when(postProductionTaskRepository.save(any(PostProductionTask.class))).thenReturn(task);

        PostProductionTaskResponse response = postProductionTaskService.moveStatus(taskId, PostProductionTaskStatus.DONE);

        assertNotNull(response);
        assertEquals(PostProductionTaskStatus.DONE, response.getStatus());
    }

    @Test
    void deleteTask_Succeeds() {
        UUID taskId = UUID.randomUUID();
        PostProductionTask task = new PostProductionTask();
        task.setId(taskId);
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(postProductionTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(task));
        doNothing().when(postProductionTaskRepository).delete(task);

        assertDoesNotThrow(() -> postProductionTaskService.deleteTask(taskId));
        verify(postProductionTaskRepository, times(1)).delete(task);
    }
}
