package com.studioops.deliverable;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.project.Project;
import com.studioops.project.ProjectRepository;
import com.studioops.studio.StudioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import com.studioops.deliverable.dto.DeliverableCreateRequest;
import com.studioops.deliverable.dto.DeliverableResponse;
import com.studioops.deliverable.dto.DeliverableUpdateRequest;

class DeliverableServiceTest {

    @Mock
    private DeliverableRepository deliverableRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private StudioRepository studioRepository;

    @InjectMocks
    private DeliverableService deliverableService;

    private UUID projectId;
    private Project project;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        projectId = UUID.randomUUID();
        project = new Project();
        project.setId(projectId);
        project.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        lenient().when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
    }

    @Test
    void createDeliverable_Success() {
        DeliverableCreateRequest request = new DeliverableCreateRequest(
                projectId, "Edited Photos", DeliverableType.PHOTOS, DeliverableStatus.NOT_STARTED,
                "s3://bucket/photos.zip", LocalDate.of(2026, 6, 20)
        );

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));

        Deliverable deliverable = new Deliverable();
        deliverable.setId(UUID.randomUUID());
        deliverable.setProjectId(projectId);
        deliverable.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        deliverable.setName(request.getName());
        deliverable.setDeliverableType(request.getDeliverableType());
        deliverable.setStatus(request.getStatus());
        deliverable.setReferenceUrl(request.getReferenceUrl());
        deliverable.setDueDate(request.getDueDate());

        when(deliverableRepository.save(any(Deliverable.class))).thenReturn(deliverable);

        DeliverableResponse response = deliverableService.createDeliverable(request);

        assertNotNull(response);
        assertEquals(deliverable.getId(), response.getId());
        assertEquals(projectId, response.getProjectId());
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
        assertEquals("Edited Photos", response.getName());
        verify(deliverableRepository, times(1)).save(any(Deliverable.class));
    }

    @Test
    void createDeliverable_DefaultsToDefaultStudio_WhenStudioIdMissing() {
        DeliverableCreateRequest request = new DeliverableCreateRequest(
                projectId, "Edited Photos", DeliverableType.PHOTOS, DeliverableStatus.NOT_STARTED,
                "s3://bucket/photos.zip", LocalDate.of(2026, 6, 20)
        );

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));

        Deliverable deliverable = new Deliverable();
        deliverable.setId(UUID.randomUUID());
        deliverable.setProjectId(projectId);
        deliverable.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        deliverable.setName(request.getName());
        deliverable.setDeliverableType(request.getDeliverableType());
        deliverable.setStatus(request.getStatus());

        when(deliverableRepository.save(any(Deliverable.class))).thenReturn(deliverable);

        DeliverableResponse response = deliverableService.createDeliverable(request);

        assertNotNull(response);
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
    }

    @Test
    void createDeliverable_Fails_WhenStudioIdDoesNotExist() {
        UUID nonExistentStudioId = UUID.randomUUID();
        DeliverableCreateRequest request = new DeliverableCreateRequest(
                projectId, "Edited Photos", DeliverableType.PHOTOS, DeliverableStatus.NOT_STARTED,
                "s3://bucket/photos.zip", LocalDate.of(2026, 6, 20)
        );
        request.setStudioId(nonExistentStudioId);

        when(studioRepository.existsById(nonExistentStudioId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> deliverableService.createDeliverable(request));
        verify(deliverableRepository, never()).save(any(Deliverable.class));
    }

    @Test
    void createDeliverable_ProjectNotFound_ThrowsException() {
        DeliverableCreateRequest request = new DeliverableCreateRequest(
                projectId, "Edited Photos", DeliverableType.PHOTOS, DeliverableStatus.NOT_STARTED,
                null, null
        );

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> deliverableService.createDeliverable(request));
        verify(deliverableRepository, never()).save(any(Deliverable.class));
    }

    @Test
    void createDeliverable_ProjectDoesNotBelongToSameStudio() {
        UUID customStudioId = UUID.randomUUID();
        DeliverableCreateRequest request = new DeliverableCreateRequest(
                projectId, "Edited Photos", DeliverableType.PHOTOS, DeliverableStatus.NOT_STARTED,
                null, null
        );
        request.setStudioId(customStudioId);

        when(projectRepository.findByIdAndStudioId(projectId, customStudioId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> deliverableService.createDeliverable(request));
        verify(deliverableRepository, never()).save(any(Deliverable.class));
    }

    @Test
    void listDeliverables_All() {
        Deliverable d1 = new Deliverable();
        d1.setProjectId(projectId);
        d1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        Deliverable d2 = new Deliverable();
        d2.setProjectId(UUID.randomUUID());
        d2.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(deliverableRepository.findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(List.of(d1, d2));

        List<DeliverableResponse> list = deliverableService.listDeliverables(null);

        assertEquals(2, list.size());
        verify(deliverableRepository, times(1)).findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        verify(deliverableRepository, never()).findByProjectIdAndStudioId(any(UUID.class), any(UUID.class));
    }

    @Test
    void listDeliverables_ByProject_Success() {
        Deliverable d1 = new Deliverable();
        d1.setProjectId(projectId);
        d1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));
        when(deliverableRepository.findByProjectIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(List.of(d1));

        List<DeliverableResponse> list = deliverableService.listDeliverables(projectId);

        assertEquals(1, list.size());
        assertEquals(projectId, list.get(0).getProjectId());
        verify(deliverableRepository, times(1)).findByProjectIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID);
        verify(deliverableRepository, never()).findAllByStudioId(any(UUID.class));
    }

    @Test
    void listDeliverables_ByProject_ProjectNotFound() {
        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> deliverableService.listDeliverables(projectId));
    }

    @Test
    void getDeliverableById_Success() {
        UUID id = UUID.randomUUID();
        Deliverable deliverable = new Deliverable();
        deliverable.setId(id);
        deliverable.setProjectId(projectId);
        deliverable.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        deliverable.setName("Teaser Video");

        when(deliverableRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(deliverable));

        DeliverableResponse response = deliverableService.getDeliverableById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("Teaser Video", response.getName());
    }

    @Test
    void getDeliverableById_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(deliverableRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> deliverableService.getDeliverableById(id));
    }

    @Test
    void updateDeliverable_Success() {
        UUID id = UUID.randomUUID();
        Deliverable deliverable = new Deliverable();
        deliverable.setId(id);
        deliverable.setProjectId(projectId);
        deliverable.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        deliverable.setName("Old Name");
        deliverable.setDeliverableType(DeliverableType.PHOTOS);
        deliverable.setStatus(DeliverableStatus.NOT_STARTED);

        DeliverableUpdateRequest request = new DeliverableUpdateRequest(
                "New Name", DeliverableType.PHOTOS, DeliverableStatus.IN_PROGRESS,
                "s3://new-url", LocalDate.of(2026, 7, 1)
        );

        when(deliverableRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(deliverable));
        when(deliverableRepository.save(any(Deliverable.class))).thenReturn(deliverable);

        DeliverableResponse response = deliverableService.updateDeliverable(id, request);

        assertNotNull(response);
        assertEquals("New Name", response.getName());
        assertEquals(DeliverableStatus.IN_PROGRESS, response.getStatus());
        assertEquals("s3://new-url", response.getReferenceUrl());
    }

    @Test
    void deleteDeliverable_Success() {
        UUID id = UUID.randomUUID();
        Deliverable deliverable = new Deliverable();
        deliverable.setId(id);
        deliverable.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(deliverableRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(deliverable));
        doNothing().when(deliverableRepository).delete(deliverable);

        assertDoesNotThrow(() -> deliverableService.deleteDeliverable(id));
        verify(deliverableRepository, times(1)).delete(deliverable);
    }

    @Test
    void deleteDeliverable_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(deliverableRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> deliverableService.deleteDeliverable(id));
        verify(deliverableRepository, never()).delete(any(Deliverable.class));
    }
}
