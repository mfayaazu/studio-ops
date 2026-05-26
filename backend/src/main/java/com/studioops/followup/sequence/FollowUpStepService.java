package com.studioops.followup.sequence;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
import com.studioops.followup.template.MessageTemplateRepository;
import com.studioops.followup.sequence.dto.FollowUpStepCreateRequest;
import com.studioops.followup.sequence.dto.FollowUpStepResponse;
import com.studioops.followup.sequence.dto.FollowUpStepUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FollowUpStepService {

    private final FollowUpStepRepository followUpStepRepository;
    private final FollowUpSequenceRepository followUpSequenceRepository;
    private final MessageTemplateRepository messageTemplateRepository;
    private final StudioRepository studioRepository;
    private final TenantContext tenantContext;

    public FollowUpStepService(FollowUpStepRepository followUpStepRepository,
                              FollowUpSequenceRepository followUpSequenceRepository,
                              MessageTemplateRepository messageTemplateRepository,
                              StudioRepository studioRepository,
                              TenantContext tenantContext) {
        this.followUpStepRepository = followUpStepRepository;
        this.followUpSequenceRepository = followUpSequenceRepository;
        this.messageTemplateRepository = messageTemplateRepository;
        this.studioRepository = studioRepository;
        this.tenantContext = tenantContext;
    }

    public FollowUpStepResponse createStep(FollowUpStepCreateRequest request) {
        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

        if (!studioRepository.existsById(studioId)) {
            throw new IllegalArgumentException("Studio not found with id: " + studioId);
        }

        // Validate sequence exists and belongs to the same studio
        followUpSequenceRepository.findByIdAndStudioId(request.getSequenceId(), studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up sequence not found with id: " + request.getSequenceId()));

        // Validate template exists and belongs to the same studio
        messageTemplateRepository.findByIdAndStudioId(request.getTemplateId(), studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Message template not found with id: " + request.getTemplateId()));

        // Prevent duplicate stepOrder within the same sequence
        if (followUpStepRepository.existsBySequenceIdAndStepOrder(request.getSequenceId(), request.getStepOrder())) {
            throw new IllegalArgumentException("Step with order " + request.getStepOrder() + " already exists for sequence " + request.getSequenceId());
        }

        FollowUpStep step = new FollowUpStep();
        step.setStudioId(studioId);
        step.setSequenceId(request.getSequenceId());
        step.setStepOrder(request.getStepOrder());
        step.setDelayDays(request.getDelayDays());
        step.setChannel(request.getChannel());
        step.setTemplateId(request.getTemplateId());
        step.setGoal(request.getGoal() != null ? request.getGoal().trim() : null);
        step.setActive(request.getActive() != null ? request.getActive() : true);

        FollowUpStep saved = followUpStepRepository.save(step);
        return FollowUpStepMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FollowUpStepResponse> listStepsBySequence(UUID sequenceId) {
        UUID studioId = tenantContext.getCurrentStudioId();
        // Validate sequence belongs to studio
        followUpSequenceRepository.findByIdAndStudioId(sequenceId, studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up sequence not found with id: " + sequenceId));

        List<FollowUpStep> steps = followUpStepRepository.findBySequenceIdAndStudioIdOrderByStepOrderAsc(sequenceId, studioId);
        return steps.stream()
                .map(FollowUpStepMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FollowUpStepResponse getStepById(UUID id) {
        FollowUpStep step = followUpStepRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up step not found with id: " + id));
        return FollowUpStepMapper.toResponse(step);
    }

    public FollowUpStepResponse updateStep(UUID id, FollowUpStepUpdateRequest request) {
        FollowUpStep step = followUpStepRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up step not found with id: " + id));

        // Validate template belongs to the same studio
        messageTemplateRepository.findByIdAndStudioId(request.getTemplateId(), step.getStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Message template not found with id: " + request.getTemplateId()));

        // Prevent duplicate stepOrder conflicts
        if (followUpStepRepository.existsBySequenceIdAndStepOrderAndIdNot(step.getSequenceId(), request.getStepOrder(), id)) {
            throw new IllegalArgumentException("Step with order " + request.getStepOrder() + " already exists for sequence " + step.getSequenceId());
        }

        step.setStepOrder(request.getStepOrder());
        step.setDelayDays(request.getDelayDays());
        step.setChannel(request.getChannel());
        step.setTemplateId(request.getTemplateId());
        step.setGoal(request.getGoal() != null ? request.getGoal().trim() : null);
        step.setActive(request.getActive());

        FollowUpStep updated = followUpStepRepository.save(step);
        return FollowUpStepMapper.toResponse(updated);
    }

    public void deleteStep(UUID id) {
        FollowUpStep step = followUpStepRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up step not found with id: " + id));
        followUpStepRepository.delete(step);
    }
}
