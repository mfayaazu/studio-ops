package com.studioops.postproduction.task;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.deliverable.Deliverable;
import com.studioops.deliverable.DeliverableRepository;
import com.studioops.employee.EmployeeRepository;
import com.studioops.postproduction.task.dto.PostProductionTaskCreateRequest;
import com.studioops.postproduction.task.dto.PostProductionTaskResponse;
import com.studioops.postproduction.task.dto.PostProductionTaskUpdateRequest;
import com.studioops.project.ProjectRepository;
import com.studioops.studio.StudioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PostProductionTaskService {

    private final PostProductionTaskRepository postProductionTaskRepository;
    private final ProjectRepository projectRepository;
    private final DeliverableRepository deliverableRepository;
    private final StudioRepository studioRepository;
    private final EmployeeRepository employeeRepository;

    public PostProductionTaskService(
            PostProductionTaskRepository postProductionTaskRepository,
            ProjectRepository projectRepository,
            DeliverableRepository deliverableRepository,
            StudioRepository studioRepository,
            EmployeeRepository employeeRepository) {
        this.postProductionTaskRepository = postProductionTaskRepository;
        this.projectRepository = projectRepository;
        this.deliverableRepository = deliverableRepository;
        this.studioRepository = studioRepository;
        this.employeeRepository = employeeRepository;
    }

    public PostProductionTaskResponse createTask(PostProductionTaskCreateRequest request) {
        UUID studioId = request.getStudioId() != null ? request.getStudioId() : TenantConstants.DEFAULT_STUDIO_ID;

        // Validate studio exists
        if (!studioRepository.existsById(studioId)) {
            throw new ResourceNotFoundException("Studio not found with id: " + studioId);
        }

        // Validate project exists and belongs to the same studio
        projectRepository.findByIdAndStudioId(request.getProjectId(), studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        // Validate deliverable exists and belongs to the same studio
        Deliverable deliverable = deliverableRepository.findByIdAndStudioId(request.getDeliverableId(), studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found with id: " + request.getDeliverableId()));

        // Validate deliverable.projectId matches task.projectId
        if (!deliverable.getProjectId().equals(request.getProjectId())) {
            throw new IllegalArgumentException("Deliverable does not belong to the specified project");
        }

        // Validate assigned employee belongs to the same studio
        if (request.getAssignedEmployeeId() != null) {
            employeeRepository.findByIdAndStudioId(request.getAssignedEmployeeId(), studioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found in the same studio with id: " + request.getAssignedEmployeeId()));
        }

        // Apply defaults in request DTO if missing
        if (request.getPriority() == null) {
            request.setPriority(PostProductionTaskPriority.MEDIUM);
        }
        if (request.getStatus() == null) {
            request.setStatus(PostProductionTaskStatus.TODO);
        }
        if (request.getSortOrder() == null) {
            request.setSortOrder(0);
        }

        PostProductionTask task = PostProductionTaskMapper.toEntity(request);
        task.setStudioId(studioId);

        PostProductionTask saved = postProductionTaskRepository.save(task);
        return PostProductionTaskMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PostProductionTaskResponse> listTasks(
            UUID projectId,
            UUID deliverableId,
            PostProductionTaskStatus status,
            UUID assignedEmployeeId,
            LocalDate dueBefore,
            String search) {

        UUID studioId = TenantConstants.DEFAULT_STUDIO_ID;

        List<PostProductionTask> tasks = postProductionTaskRepository.filterTasks(
                studioId,
                projectId,
                deliverableId,
                status,
                assignedEmployeeId,
                dueBefore,
                (search != null && !search.trim().isEmpty()) ? search.trim() : null
        );

        return tasks.stream()
                .map(PostProductionTaskMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PostProductionTaskResponse getTaskById(UUID id) {
        PostProductionTask task = postProductionTaskRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("PostProductionTask not found with id: " + id));
        return PostProductionTaskMapper.toResponse(task);
    }

    public PostProductionTaskResponse updateTask(UUID id, PostProductionTaskUpdateRequest request) {
        PostProductionTask task = postProductionTaskRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("PostProductionTask not found with id: " + id));

        // Validate assigned employee belongs to the same studio
        if (request.getAssignedEmployeeId() != null) {
            employeeRepository.findByIdAndStudioId(request.getAssignedEmployeeId(), task.getStudioId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found in the same studio with id: " + request.getAssignedEmployeeId()));
        }

        PostProductionTaskMapper.updateEntity(task, request);
        PostProductionTask saved = postProductionTaskRepository.save(task);
        return PostProductionTaskMapper.toResponse(saved);
    }

    public PostProductionTaskResponse moveStatus(UUID id, PostProductionTaskStatus newStatus) {
        PostProductionTask task = postProductionTaskRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("PostProductionTask not found with id: " + id));

        task.setStatus(newStatus);
        PostProductionTask saved = postProductionTaskRepository.save(task);
        return PostProductionTaskMapper.toResponse(saved);
    }

    public void deleteTask(UUID id) {
        PostProductionTask task = postProductionTaskRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("PostProductionTask not found with id: " + id));
        postProductionTaskRepository.delete(task);
    }
}
