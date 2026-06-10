package com.studioops.followup.sequence;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
import com.studioops.followup.sequence.dto.FollowUpSequenceCreateRequest;
import com.studioops.followup.sequence.dto.FollowUpSequenceResponse;
import com.studioops.followup.sequence.dto.FollowUpSequenceUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FollowUpSequenceService {

    private final FollowUpSequenceRepository followUpSequenceRepository;
    private final StudioRepository studioRepository;
    private final TenantContext tenantContext;

    public FollowUpSequenceService(FollowUpSequenceRepository followUpSequenceRepository, StudioRepository studioRepository, TenantContext tenantContext) {
        this.followUpSequenceRepository = followUpSequenceRepository;
        this.studioRepository = studioRepository;
        this.tenantContext = tenantContext;
    }

    public FollowUpSequenceResponse createSequence(FollowUpSequenceCreateRequest request) {
        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

        if (!studioRepository.existsById(studioId)) {
            throw new IllegalArgumentException("Studio not found with id: " + studioId);
        }

        if (followUpSequenceRepository.existsByStudioIdAndNameIgnoreCase(studioId, request.getName())) {
            throw new IllegalArgumentException("Follow-up sequence with name '" + request.getName() + "' already exists for studio: " + studioId);
        }

        FollowUpSequence sequence = new FollowUpSequence();
        sequence.setStudioId(studioId);
        sequence.setName(request.getName().trim());
        sequence.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        sequence.setActive(request.getActive() != null ? request.getActive() : true);
        sequence.setApplicableStage(request.getApplicableStage());

        FollowUpSequence saved = followUpSequenceRepository.save(sequence);
        return FollowUpSequenceMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FollowUpSequenceResponse> listSequences(String search) {
        return listSequencesForStudio(tenantContext.getCurrentStudioId(), search);
    }

    @Transactional(readOnly = true)
    public List<FollowUpSequenceResponse> listSequencesForStudio(UUID studioId, String search) {
        List<FollowUpSequence> sequences;
        if (search == null || search.trim().isEmpty()) {
            sequences = followUpSequenceRepository.findAllByStudioId(studioId);
        } else {
            sequences = followUpSequenceRepository.searchByStudioId(studioId, search.trim());
        }
        return sequences.stream()
                .map(FollowUpSequenceMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FollowUpSequenceResponse getSequenceById(UUID id) {
        FollowUpSequence sequence = followUpSequenceRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up sequence not found with id: " + id));
        return FollowUpSequenceMapper.toResponse(sequence);
    }

    public FollowUpSequenceResponse updateSequence(UUID id, FollowUpSequenceUpdateRequest request) {
        FollowUpSequence sequence = followUpSequenceRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up sequence not found with id: " + id));

        if (followUpSequenceRepository.existsByStudioIdAndNameIgnoreCaseAndIdNot(sequence.getStudioId(), request.getName(), id)) {
            throw new IllegalArgumentException("Follow-up sequence with name '" + request.getName() + "' already exists for studio: " + sequence.getStudioId());
        }

        sequence.setName(request.getName().trim());
        sequence.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        sequence.setActive(request.getActive());
        sequence.setApplicableStage(request.getApplicableStage());

        FollowUpSequence updated = followUpSequenceRepository.save(sequence);
        return FollowUpSequenceMapper.toResponse(updated);
    }

    public void deleteSequence(UUID id) {
        FollowUpSequence sequence = followUpSequenceRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up sequence not found with id: " + id));
        followUpSequenceRepository.delete(sequence);
    }
}
