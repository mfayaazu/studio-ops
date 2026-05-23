package com.studioops.followup.sequence;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
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

    public FollowUpSequenceService(FollowUpSequenceRepository followUpSequenceRepository, StudioRepository studioRepository) {
        this.followUpSequenceRepository = followUpSequenceRepository;
        this.studioRepository = studioRepository;
    }

    public FollowUpSequenceResponse createSequence(FollowUpSequenceCreateRequest request) {
        UUID studioId = request.getStudioId() != null ? request.getStudioId() : TenantConstants.DEFAULT_STUDIO_ID;
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

        FollowUpSequence saved = followUpSequenceRepository.save(sequence);
        return FollowUpSequenceMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FollowUpSequenceResponse> listSequences(String search) {
        return listSequencesForStudio(TenantConstants.DEFAULT_STUDIO_ID, search);
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
        FollowUpSequence sequence = followUpSequenceRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up sequence not found with id: " + id));
        return FollowUpSequenceMapper.toResponse(sequence);
    }

    public FollowUpSequenceResponse updateSequence(UUID id, FollowUpSequenceUpdateRequest request) {
        FollowUpSequence sequence = followUpSequenceRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up sequence not found with id: " + id));

        if (followUpSequenceRepository.existsByStudioIdAndNameIgnoreCaseAndIdNot(sequence.getStudioId(), request.getName(), id)) {
            throw new IllegalArgumentException("Follow-up sequence with name '" + request.getName() + "' already exists for studio: " + sequence.getStudioId());
        }

        sequence.setName(request.getName().trim());
        sequence.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        sequence.setActive(request.getActive());

        FollowUpSequence updated = followUpSequenceRepository.save(sequence);
        return FollowUpSequenceMapper.toResponse(updated);
    }

    public void deleteSequence(UUID id) {
        FollowUpSequence sequence = followUpSequenceRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up sequence not found with id: " + id));
        followUpSequenceRepository.delete(sequence);
    }
}
