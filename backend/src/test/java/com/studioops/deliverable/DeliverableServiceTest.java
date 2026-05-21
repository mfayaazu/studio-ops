package com.studioops.deliverable;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.project.ProjectRepository;
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

    @InjectMocks
    private DeliverableService deliverableService;

    private UUID projectId;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        projectId = UUID.randomUUID();
    }

    @Test
    void createDeliverable_Success() {
        DeliverableCreateRequest request = new DeliverableCreateRequest(
                projectId, "Edited Photos", DeliverableType.PHOTOS, DeliverableStatus.NOT_STARTED,
                "s3://bucket/photos.zip", LocalDate.of(2026, 6, 20)
        );

        when(projectRepository.existsById(projectId)).thenReturn(true);

        Deliverable deliverable = new Deliverable();
        deliverable.setId(UUID.randomUUID());
        deliverable.setProjectId(projectId);
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
        assertEquals("Edited Photos", response.getName());
        verify(deliverableRepository, times(1)).save(any(Deliverable.class));
    }

    @Test
    void createDeliverable_ProjectNotFound_ThrowsException() {
        DeliverableCreateRequest request = new DeliverableCreateRequest(
                projectId, "Edited Photos", DeliverableType.PHOTOS, DeliverableStatus.NOT_STARTED,
                null, null
        );

        when(projectRepository.existsById(projectId)).thenReturn(false);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> deliverableService.createDeliverable(request));
        assertTrue(exception.getMessage().contains("Project not found with id"));
        verify(deliverableRepository, never()).save(any(Deliverable.class));
    }

    @Test
    void listDeliverables_All() {
        Deliverable d1 = new Deliverable();
        d1.setProjectId(projectId);
        Deliverable d2 = new Deliverable();
        d2.setProjectId(UUID.randomUUID());

        when(deliverableRepository.findAll()).thenReturn(List.of(d1, d2));

        List<DeliverableResponse> list = deliverableService.listDeliverables(null);

        assertEquals(2, list.size());
        verify(deliverableRepository, times(1)).findAll();
        verify(deliverableRepository, never()).findByProjectId(any(UUID.class));
    }

    @Test
    void listDeliverables_ByProject() {
        Deliverable d1 = new Deliverable();
        d1.setProjectId(projectId);

        when(deliverableRepository.findByProjectId(projectId)).thenReturn(List.of(d1));

        List<DeliverableResponse> list = deliverableService.listDeliverables(projectId);

        assertEquals(1, list.size());
        assertEquals(projectId, list.get(0).getProjectId());
        verify(deliverableRepository, times(1)).findByProjectId(projectId);
        verify(deliverableRepository, never()).findAll();
    }

    @Test
    void getDeliverableById_Success() {
        UUID id = UUID.randomUUID();
        Deliverable deliverable = new Deliverable();
        deliverable.setId(id);
        deliverable.setProjectId(projectId);
        deliverable.setName("Teaser Video");

        when(deliverableRepository.findById(id)).thenReturn(Optional.of(deliverable));

        DeliverableResponse response = deliverableService.getDeliverableById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("Teaser Video", response.getName());
    }

    @Test
    void getDeliverableById_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(deliverableRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> deliverableService.getDeliverableById(id));
    }

    @Test
    void updateDeliverable_Success() {
        UUID id = UUID.randomUUID();
        Deliverable deliverable = new Deliverable();
        deliverable.setId(id);
        deliverable.setProjectId(projectId);
        deliverable.setName("Old Name");
        deliverable.setDeliverableType(DeliverableType.PHOTOS);
        deliverable.setStatus(DeliverableStatus.NOT_STARTED);

        DeliverableUpdateRequest request = new DeliverableUpdateRequest(
                "New Name", DeliverableType.PHOTOS, DeliverableStatus.IN_PROGRESS,
                "s3://new-url", LocalDate.of(2026, 7, 1)
        );

        when(deliverableRepository.findById(id)).thenReturn(Optional.of(deliverable));
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
        when(deliverableRepository.existsById(id)).thenReturn(true);
        doNothing().when(deliverableRepository).deleteById(id);

        assertDoesNotThrow(() -> deliverableService.deleteDeliverable(id));
        verify(deliverableRepository, times(1)).deleteById(id);
    }

    @Test
    void deleteDeliverable_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(deliverableRepository.existsById(id)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> deliverableService.deleteDeliverable(id));
        verify(deliverableRepository, never()).deleteById(id);
    }
}
