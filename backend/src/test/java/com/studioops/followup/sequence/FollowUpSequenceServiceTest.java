package com.studioops.followup.sequence;

import com.studioops.common.tenant.TenantContext;
import com.studioops.common.tenant.TenantConstants;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.studio.StudioRepository;
import com.studioops.followup.sequence.dto.FollowUpSequenceCreateRequest;
import com.studioops.followup.sequence.dto.FollowUpSequenceResponse;
import com.studioops.followup.sequence.dto.FollowUpSequenceUpdateRequest;
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

class FollowUpSequenceServiceTest {
    @Mock
    private TenantContext tenantContext;


    @Mock
    private FollowUpSequenceRepository followUpSequenceRepository;

    @Mock
    private StudioRepository studioRepository;

    @InjectMocks
    private FollowUpSequenceService followUpSequenceService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(tenantContext.getCurrentStudioId()).thenReturn(TenantConstants.DEFAULT_STUDIO_ID);
        when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
    }

    @Test
    void createSequence_Success_DefaultsToDefaultStudioId() {
        FollowUpSequenceCreateRequest request = new FollowUpSequenceCreateRequest(
                null, "Default Sequence", "Follows up over 10 days", null
        );

        FollowUpSequence sequence = new FollowUpSequence();
        sequence.setId(UUID.randomUUID());
        sequence.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        sequence.setName(request.getName());
        sequence.setDescription(request.getDescription());
        sequence.setActive(true);
        sequence.setCreatedAt(Instant.now());
        sequence.setUpdatedAt(Instant.now());

        when(followUpSequenceRepository.existsByStudioIdAndNameIgnoreCase(TenantConstants.DEFAULT_STUDIO_ID, request.getName()))
                .thenReturn(false);
        when(followUpSequenceRepository.save(any(FollowUpSequence.class))).thenReturn(sequence);

        FollowUpSequenceResponse response = followUpSequenceService.createSequence(request);

        assertNotNull(response);
        assertEquals(sequence.getId(), response.getId());
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
        assertEquals(request.getName(), response.getName());
        assertEquals(request.getDescription(), response.getDescription());
        assertTrue(response.isActive());

        verify(studioRepository, times(1)).existsById(TenantConstants.DEFAULT_STUDIO_ID);
        verify(followUpSequenceRepository, times(1)).save(any(FollowUpSequence.class));
    }

    @Test
    void createSequence_CustomStudioId_Success() {
        UUID customStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(customStudioId);
        FollowUpSequenceCreateRequest request = new FollowUpSequenceCreateRequest(
                customStudioId, "Default Sequence", "Desc", false
        );

        FollowUpSequence sequence = new FollowUpSequence();
        sequence.setId(UUID.randomUUID());
        sequence.setStudioId(customStudioId);
        sequence.setName(request.getName());
        sequence.setDescription(request.getDescription());
        sequence.setActive(false);

        when(followUpSequenceRepository.existsByStudioIdAndNameIgnoreCase(customStudioId, request.getName()))
                .thenReturn(false);
        when(followUpSequenceRepository.save(any(FollowUpSequence.class))).thenReturn(sequence);

        FollowUpSequenceResponse response = followUpSequenceService.createSequence(request);

        assertNotNull(response);
        assertEquals(customStudioId, response.getStudioId());
        assertFalse(response.isActive());
        verify(studioRepository, times(1)).existsById(customStudioId);
    }

    @Test
    void createSequence_StudioNotFound_ThrowsException() {
        UUID nonExistentStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(nonExistentStudioId);
        FollowUpSequenceCreateRequest request = new FollowUpSequenceCreateRequest(
                nonExistentStudioId, "Seq Name", "Desc", true
        );

        when(studioRepository.existsById(nonExistentStudioId)).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                followUpSequenceService.createSequence(request)
        );
        assertEquals("Studio not found with id: " + nonExistentStudioId, exception.getMessage());
        verify(followUpSequenceRepository, never()).save(any(FollowUpSequence.class));
    }

    @Test
    void createSequence_DuplicateName_ThrowsException() {
        FollowUpSequenceCreateRequest request = new FollowUpSequenceCreateRequest(
                null, "Duplicate Name", "Desc", true
        );

        when(followUpSequenceRepository.existsByStudioIdAndNameIgnoreCase(TenantConstants.DEFAULT_STUDIO_ID, request.getName()))
                .thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                followUpSequenceService.createSequence(request)
        );
        assertTrue(exception.getMessage().contains("already exists"));
        verify(followUpSequenceRepository, never()).save(any(FollowUpSequence.class));
    }

    @Test
    void getSequenceById_Success() {
        UUID id = UUID.randomUUID();
        FollowUpSequence sequence = new FollowUpSequence();
        sequence.setId(id);
        sequence.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        sequence.setName("Test Seq");

        when(followUpSequenceRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(sequence));

        FollowUpSequenceResponse response = followUpSequenceService.getSequenceById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("Test Seq", response.getName());
    }

    @Test
    void getSequenceById_NotFound_ThrowsResourceNotFoundException() {
        UUID id = UUID.randomUUID();
        when(followUpSequenceRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> followUpSequenceService.getSequenceById(id));
    }

    @Test
    void updateSequence_Success() {
        UUID id = UUID.randomUUID();
        FollowUpSequence sequence = new FollowUpSequence();
        sequence.setId(id);
        sequence.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        sequence.setName("Test Seq");
        sequence.setActive(true);

        FollowUpSequenceUpdateRequest request = new FollowUpSequenceUpdateRequest(
                "Updated Name", "Updated Desc", false
        );

        when(followUpSequenceRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(sequence));
        when(followUpSequenceRepository.existsByStudioIdAndNameIgnoreCaseAndIdNot(TenantConstants.DEFAULT_STUDIO_ID, request.getName(), id))
                .thenReturn(false);
        when(followUpSequenceRepository.save(any(FollowUpSequence.class))).thenReturn(sequence);

        FollowUpSequenceResponse response = followUpSequenceService.updateSequence(id, request);

        assertNotNull(response);
        assertEquals("Updated Name", response.getName());
        assertEquals("Updated Desc", response.getDescription());
        assertFalse(response.isActive());
    }

    @Test
    void updateSequence_DuplicateConflict_ThrowsIllegalArgumentException() {
        UUID id = UUID.randomUUID();
        FollowUpSequence sequence = new FollowUpSequence();
        sequence.setId(id);
        sequence.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        sequence.setName("Test Seq");

        FollowUpSequenceUpdateRequest request = new FollowUpSequenceUpdateRequest(
                "Duplicate Name", "Desc", false
        );

        when(followUpSequenceRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(sequence));
        when(followUpSequenceRepository.existsByStudioIdAndNameIgnoreCaseAndIdNot(TenantConstants.DEFAULT_STUDIO_ID, request.getName(), id))
                .thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                followUpSequenceService.updateSequence(id, request)
        );
        assertTrue(exception.getMessage().contains("already exists"));
        verify(followUpSequenceRepository, never()).save(any(FollowUpSequence.class));
    }

    @Test
    void deleteSequence_Success() {
        UUID id = UUID.randomUUID();
        FollowUpSequence sequence = new FollowUpSequence();
        sequence.setId(id);
        sequence.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(followUpSequenceRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(sequence));
        doNothing().when(followUpSequenceRepository).delete(sequence);

        assertDoesNotThrow(() -> followUpSequenceService.deleteSequence(id));
        verify(followUpSequenceRepository, times(1)).delete(sequence);
    }

    @Test
    void listSequences_NoSearch_ReturnsAllForStudio() {
        FollowUpSequence s1 = new FollowUpSequence();
        s1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        FollowUpSequence s2 = new FollowUpSequence();
        s2.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(followUpSequenceRepository.findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(List.of(s1, s2));

        List<FollowUpSequenceResponse> responses = followUpSequenceService.listSequences(null);

        assertEquals(2, responses.size());
        verify(followUpSequenceRepository, times(1)).findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID);
    }
}
