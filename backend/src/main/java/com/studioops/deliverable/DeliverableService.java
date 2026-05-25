package com.studioops.deliverable;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.employee.EmployeeRepository;
import com.studioops.project.ProjectRepository;
import com.studioops.studio.StudioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import com.studioops.deliverable.dto.DeliverableCreateRequest;
import com.studioops.deliverable.dto.DeliverableResponse;
import com.studioops.deliverable.dto.DeliverableUpdateRequest;

@Service
@Transactional
public class DeliverableService {

    private final DeliverableRepository deliverableRepository;
    private final ProjectRepository projectRepository;
    private final StudioRepository studioRepository;
    private final EmployeeRepository employeeRepository;

    public DeliverableService(DeliverableRepository deliverableRepository,
                              ProjectRepository projectRepository,
                              StudioRepository studioRepository,
                              EmployeeRepository employeeRepository) {
        this.deliverableRepository = deliverableRepository;
        this.projectRepository = projectRepository;
        this.studioRepository = studioRepository;
        this.employeeRepository = employeeRepository;
    }

    public DeliverableResponse createDeliverable(DeliverableCreateRequest request) {
        UUID studioId = request.getStudioId() != null ? request.getStudioId() : TenantConstants.DEFAULT_STUDIO_ID;

        // Validate studio exists
        if (!studioRepository.existsById(studioId)) {
            throw new ResourceNotFoundException("Studio not found with id: " + studioId);
        }

        // Validate project exists and belongs to the same studio
        projectRepository.findByIdAndStudioId(request.getProjectId(), studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        // Validate assigned employee belongs to the same studio
        if (request.getAssignedEmployeeId() != null) {
            employeeRepository.findByIdAndStudioId(request.getAssignedEmployeeId(), studioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found in the same studio with id: " + request.getAssignedEmployeeId()));
        }

        if (request.getPriority() == null) {
            request.setPriority(DeliverablePriority.MEDIUM);
        }

        Deliverable deliverable = DeliverableMapper.toEntity(request);
        deliverable.setStudioId(studioId);

        Deliverable saved = deliverableRepository.save(deliverable);
        return DeliverableMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DeliverableResponse> listDeliverables(UUID projectId) {
        List<Deliverable> deliverables;
        UUID studioId = TenantConstants.DEFAULT_STUDIO_ID;

        if (projectId != null) {
            // Validate project belongs to default studio
            projectRepository.findByIdAndStudioId(projectId, studioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
            deliverables = deliverableRepository.findByProjectIdAndStudioId(projectId, studioId);
        } else {
            deliverables = deliverableRepository.findAllByStudioId(studioId);
        }

        return deliverables.stream()
                .map(DeliverableMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DeliverableResponse getDeliverableById(UUID id) {
        Deliverable deliverable = deliverableRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found with id: " + id));
        return DeliverableMapper.toResponse(deliverable);
    }

    public DeliverableResponse updateDeliverable(UUID id, DeliverableUpdateRequest request) {
        Deliverable deliverable = deliverableRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found with id: " + id));

        // Validate assigned employee belongs to the same studio
        if (request.getAssignedEmployeeId() != null) {
            employeeRepository.findByIdAndStudioId(request.getAssignedEmployeeId(), deliverable.getStudioId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found in the same studio with id: " + request.getAssignedEmployeeId()));
        }

        DeliverableMapper.updateEntity(deliverable, request);
        Deliverable saved = deliverableRepository.save(deliverable);
        return DeliverableMapper.toResponse(saved);
    }

    public void deleteDeliverable(UUID id) {
        Deliverable deliverable = deliverableRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found with id: " + id));
        deliverableRepository.delete(deliverable);
    }
}
