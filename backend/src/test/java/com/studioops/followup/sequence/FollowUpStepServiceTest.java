package com.studioops.followup.sequence;

import com.studioops.common.tenant.TenantContext;
import com.studioops.common.tenant.TenantConstants;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.studio.StudioRepository;
import com.studioops.followup.template.MessageTemplate;
import com.studioops.followup.template.MessageTemplateRepository;
import com.studioops.followup.template.CommunicationChannel;
import com.studioops.followup.sequence.dto.FollowUpStepCreateRequest;
import com.studioops.followup.sequence.dto.FollowUpStepResponse;
import com.studioops.followup.sequence.dto.FollowUpStepUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FollowUpStepServiceTest {
    @Mock
    private TenantContext tenantContext;


    @Mock
    private FollowUpStepRepository followUpStepRepository;

    @Mock
    private FollowUpSequenceRepository followUpSequenceRepository;

    @Mock
    private MessageTemplateRepository messageTemplateRepository;

    @Mock
    private StudioRepository studioRepository;

    @InjectMocks
    private FollowUpStepService followUpStepService;

    private UUID sequenceId;
    private UUID templateId;
    private FollowUpSequence sequence;
    private MessageTemplate template;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(tenantContext.getCurrentStudioId()).thenReturn(TenantConstants.DEFAULT_STUDIO_ID);
        when(studioRepository.existsById(any(UUID.class))).thenReturn(true);

        sequenceId = UUID.randomUUID();
        templateId = UUID.randomUUID();

        sequence = new FollowUpSequence();
        sequence.setId(sequenceId);
        sequence.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        template = new MessageTemplate();
        template.setId(templateId);
        template.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(followUpSequenceRepository.findByIdAndStudioId(sequenceId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(sequence));
        when(messageTemplateRepository.findByIdAndStudioId(templateId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(template));
    }

    @Test
    void createStep_Success_DefaultsToDefaultStudioId() {
        FollowUpStepCreateRequest request = new FollowUpStepCreateRequest(
                null, sequenceId, 1, 3, CommunicationChannel.EMAIL, templateId, "Check in", null
        );

        FollowUpStep step = new FollowUpStep();
        step.setId(UUID.randomUUID());
        step.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        step.setSequenceId(sequenceId);
        step.setStepOrder(1);
        step.setDelayDays(3);
        step.setChannel(CommunicationChannel.EMAIL);
        step.setTemplateId(templateId);
        step.setGoal("Check in");
        step.setActive(true);
        step.setCreatedAt(Instant.now());
        step.setUpdatedAt(Instant.now());

        when(followUpStepRepository.existsBySequenceIdAndStepOrder(sequenceId, 1)).thenReturn(false);
        when(followUpStepRepository.save(any(FollowUpStep.class))).thenReturn(step);

        FollowUpStepResponse response = followUpStepService.createStep(request);

        assertNotNull(response);
        assertEquals(step.getId(), response.getId());
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
        assertEquals(sequenceId, response.getSequenceId());
        assertEquals(1, response.getStepOrder());
        assertEquals(3, response.getDelayDays());
        assertEquals(templateId, response.getTemplateId());
        assertTrue(response.isActive());

        verify(studioRepository, times(1)).existsById(TenantConstants.DEFAULT_STUDIO_ID);
        verify(followUpStepRepository, times(1)).save(any(FollowUpStep.class));
    }

    @Test
    void createStep_StudioNotFound_ThrowsException() {
        UUID nonExistentStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(nonExistentStudioId);
        FollowUpStepCreateRequest request = new FollowUpStepCreateRequest(
                nonExistentStudioId, sequenceId, 1, 3, CommunicationChannel.EMAIL, templateId, "Check", true
        );

        when(studioRepository.existsById(nonExistentStudioId)).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                followUpStepService.createStep(request)
        );
        assertEquals("Studio not found with id: " + nonExistentStudioId, exception.getMessage());
        verify(followUpStepRepository, never()).save(any(FollowUpStep.class));
    }

    @Test
    void createStep_SequenceNotFoundOrMismatchedStudio_ThrowsResourceNotFoundException() {
        FollowUpStepCreateRequest request = new FollowUpStepCreateRequest(
                null, sequenceId, 1, 3, CommunicationChannel.EMAIL, templateId, "Check", true
        );

        when(followUpSequenceRepository.findByIdAndStudioId(sequenceId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                followUpStepService.createStep(request)
        );
    }

    @Test
    void createStep_TemplateNotFoundOrMismatchedStudio_ThrowsResourceNotFoundException() {
        FollowUpStepCreateRequest request = new FollowUpStepCreateRequest(
                null, sequenceId, 1, 3, CommunicationChannel.EMAIL, templateId, "Check", true
        );

        when(messageTemplateRepository.findByIdAndStudioId(templateId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                followUpStepService.createStep(request)
        );
    }

    @Test
    void createStep_DuplicateStepOrder_ThrowsIllegalArgumentException() {
        FollowUpStepCreateRequest request = new FollowUpStepCreateRequest(
                null, sequenceId, 1, 3, CommunicationChannel.EMAIL, templateId, "Check", true
        );

        when(followUpStepRepository.existsBySequenceIdAndStepOrder(sequenceId, 1)).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                followUpStepService.createStep(request)
        );
        assertTrue(exception.getMessage().contains("already exists"));
    }

    @Test
    void listStepsBySequence_Success() {
        FollowUpStep step = new FollowUpStep();
        step.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        step.setSequenceId(sequenceId);
        step.setStepOrder(1);
        step.setDelayDays(3);
        step.setChannel(CommunicationChannel.EMAIL);
        step.setTemplateId(templateId);

        when(followUpStepRepository.findBySequenceIdAndStudioIdOrderByStepOrderAsc(sequenceId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(List.of(step));

        List<FollowUpStepResponse> responses = followUpStepService.listStepsBySequence(sequenceId);

        assertEquals(1, responses.size());
        assertEquals(sequenceId, responses.get(0).getSequenceId());
        verify(followUpSequenceRepository, times(1)).findByIdAndStudioId(sequenceId, TenantConstants.DEFAULT_STUDIO_ID);
    }

    @Test
    void listStepsBySequence_SequenceNotFound_ThrowsResourceNotFoundException() {
        when(followUpSequenceRepository.findByIdAndStudioId(sequenceId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                followUpStepService.listStepsBySequence(sequenceId)
        );
    }

    @Test
    void updateStep_Success() {
        UUID id = UUID.randomUUID();
        FollowUpStep step = new FollowUpStep();
        step.setId(id);
        step.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        step.setSequenceId(sequenceId);
        step.setStepOrder(1);
        step.setTemplateId(templateId);

        FollowUpStepUpdateRequest request = new FollowUpStepUpdateRequest(
                2, 5, CommunicationChannel.SMS, templateId, "New goal", false
        );

        when(followUpStepRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(step));
        when(followUpStepRepository.existsBySequenceIdAndStepOrderAndIdNot(sequenceId, request.getStepOrder(), id))
                .thenReturn(false);
        when(followUpStepRepository.save(any(FollowUpStep.class))).thenReturn(step);

        FollowUpStepResponse response = followUpStepService.updateStep(id, request);

        assertNotNull(response);
        assertEquals(2, response.getStepOrder());
        assertEquals(5, response.getDelayDays());
        assertEquals(CommunicationChannel.SMS, response.getChannel());
        assertFalse(response.isActive());
        assertEquals("New goal", response.getGoal());
    }

    @Test
    void updateStep_TemplateNotFoundOrMismatchedStudio_ThrowsResourceNotFoundException() {
        UUID id = UUID.randomUUID();
        FollowUpStep step = new FollowUpStep();
        step.setId(id);
        step.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        step.setSequenceId(sequenceId);

        FollowUpStepUpdateRequest request = new FollowUpStepUpdateRequest(
                2, 5, CommunicationChannel.SMS, templateId, "New goal", false
        );

        when(followUpStepRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(step));
        when(messageTemplateRepository.findByIdAndStudioId(templateId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                followUpStepService.updateStep(id, request)
        );
    }
}
