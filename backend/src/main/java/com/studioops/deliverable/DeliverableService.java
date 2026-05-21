package com.studioops.deliverable;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.project.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DeliverableService {

    private final DeliverableRepository deliverableRepository;
    private final ProjectRepository projectRepository;

    public DeliverableService(DeliverableRepository deliverableRepository, ProjectRepository projectRepository) {
        this.deliverableRepository = deliverableRepository;
        this.projectRepository = projectRepository;
    }

    public DeliverableResponse createDeliverable(DeliverableCreateRequest request) {
        if (!projectRepository.existsById(request.getProjectId())) {
            throw new IllegalArgumentException("Project not found with id: " + request.getProjectId());
        }

        Deliverable deliverable = DeliverableMapper.toEntity(request);
        Deliverable saved = deliverableRepository.save(deliverable);
        return DeliverableMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DeliverableResponse> listDeliverables(UUID projectId) {
        List<Deliverable> deliverables;
        if (projectId != null) {
            deliverables = deliverableRepository.findByProjectId(projectId);
        } else {
            deliverables = deliverableRepository.findAll();
        }
        return deliverables.stream()
                .map(DeliverableMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DeliverableResponse getDeliverableById(UUID id) {
        Deliverable deliverable = deliverableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found with id: " + id));
        return DeliverableMapper.toResponse(deliverable);
    }

    public DeliverableResponse updateDeliverable(UUID id, DeliverableUpdateRequest request) {
        Deliverable deliverable = deliverableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found with id: " + id));

        DeliverableMapper.updateEntity(deliverable, request);
        Deliverable saved = deliverableRepository.save(deliverable);
        return DeliverableMapper.toResponse(saved);
    }

    public void deleteDeliverable(UUID id) {
        if (!deliverableRepository.existsById(id)) {
            throw new ResourceNotFoundException("Deliverable not found with id: " + id);
        }
        deliverableRepository.deleteById(id);
    }
}
