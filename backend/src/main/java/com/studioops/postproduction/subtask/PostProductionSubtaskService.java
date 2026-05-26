package com.studioops.postproduction.subtask;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.employee.EmployeeRepository;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskCreateRequest;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskResponse;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskUpdateRequest;
import com.studioops.postproduction.task.PostProductionTaskRepository;
import com.studioops.studio.StudioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PostProductionSubtaskService {

    private final PostProductionSubtaskRepository postProductionSubtaskRepository;
    private final PostProductionTaskRepository postProductionTaskRepository;
    private final StudioRepository studioRepository;
    private final EmployeeRepository employeeRepository;
    private final TenantContext tenantContext;

    public PostProductionSubtaskService(
            PostProductionSubtaskRepository postProductionSubtaskRepository,
            PostProductionTaskRepository postProductionTaskRepository,
            StudioRepository studioRepository,
            EmployeeRepository employeeRepository,
            TenantContext tenantContext) {
        this.postProductionSubtaskRepository = postProductionSubtaskRepository;
        this.postProductionTaskRepository = postProductionTaskRepository;
        this.studioRepository = studioRepository;
        this.employeeRepository = employeeRepository;
        this.tenantContext = tenantContext;
    }

    public PostProductionSubtaskResponse createSubtask(PostProductionSubtaskCreateRequest request) {
        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

        // Validate studio exists
        if (!studioRepository.existsById(studioId)) {
            throw new ResourceNotFoundException("Studio not found with id: " + studioId);
        }

        // Validate task exists and belongs to the same studio
        postProductionTaskRepository.findByIdAndStudioId(request.getTaskId(), studioId)
                .orElseThrow(() -> new ResourceNotFoundException("PostProductionTask not found with id: " + request.getTaskId()));

        // Validate assigned employee belongs to the same studio
        if (request.getAssignedEmployeeId() != null) {
            employeeRepository.findByIdAndStudioId(request.getAssignedEmployeeId(), studioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found in the same studio with id: " + request.getAssignedEmployeeId()));
        }

        PostProductionSubtask subtask = PostProductionSubtaskMapper.toEntity(request);
        subtask.setStudioId(studioId);

        PostProductionSubtask saved = postProductionSubtaskRepository.save(subtask);
        return PostProductionSubtaskMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PostProductionSubtaskResponse> listSubtasks(
            UUID taskId,
            PostProductionSubtaskStatus status,
            UUID assignedEmployeeId) {

        UUID studioId = tenantContext.getCurrentStudioId();
        List<PostProductionSubtask> subtasks = postProductionSubtaskRepository.filterSubtasks(
                studioId, taskId, status, assignedEmployeeId);

        return subtasks.stream()
                .map(PostProductionSubtaskMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PostProductionSubtaskResponse getSubtaskById(UUID id) {
        PostProductionSubtask subtask = postProductionSubtaskRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("PostProductionSubtask not found with id: " + id));
        return PostProductionSubtaskMapper.toResponse(subtask);
    }

    public PostProductionSubtaskResponse updateSubtask(UUID id, PostProductionSubtaskUpdateRequest request) {
        PostProductionSubtask subtask = postProductionSubtaskRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("PostProductionSubtask not found with id: " + id));

        // Validate assigned employee belongs to the same studio
        if (request.getAssignedEmployeeId() != null) {
            employeeRepository.findByIdAndStudioId(request.getAssignedEmployeeId(), subtask.getStudioId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found in the same studio with id: " + request.getAssignedEmployeeId()));
        }

        PostProductionSubtaskMapper.updateEntity(subtask, request);
        PostProductionSubtask saved = postProductionSubtaskRepository.save(subtask);
        return PostProductionSubtaskMapper.toResponse(saved);
    }

    public PostProductionSubtaskResponse moveStatus(UUID id, PostProductionSubtaskStatus newStatus) {
        PostProductionSubtask subtask = postProductionSubtaskRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("PostProductionSubtask not found with id: " + id));

        subtask.setStatus(newStatus);
        PostProductionSubtask saved = postProductionSubtaskRepository.save(subtask);
        return PostProductionSubtaskMapper.toResponse(saved);
    }

    public void deleteSubtask(UUID id) {
        PostProductionSubtask subtask = postProductionSubtaskRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("PostProductionSubtask not found with id: " + id));
        postProductionSubtaskRepository.delete(subtask);
    }
}
