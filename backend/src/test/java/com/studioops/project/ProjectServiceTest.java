package com.studioops.project;

import com.studioops.client.ClientRepository;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.project.dto.ProjectCreateRequest;
import com.studioops.project.dto.ProjectResponse;
import com.studioops.project.dto.ProjectUpdateRequest;

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

class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private ProjectService projectService;

    private UUID clientId;
    private UUID managerId;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        clientId = UUID.randomUUID();
        managerId = UUID.randomUUID();
    }

    @Test
    void createProject_Success() {
        ProjectCreateRequest request = new ProjectCreateRequest(
                clientId, managerId, "RSA-2026-0001", "Corp Portrait", "Corporate",
                BookingStatus.INQUIRY, PaymentStatus.UNPAID, ProjectStatus.LEAD,
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 15), "Notes here"
        );

        when(clientRepository.existsById(clientId)).thenReturn(true);
        when(projectRepository.findByProjectCode("RSA-2026-0001")).thenReturn(Optional.empty());

        Project project = new Project();
        project.setId(UUID.randomUUID());
        project.setClientId(clientId);
        project.setAssignedProjectManagerId(managerId);
        project.setProjectCode(request.getProjectCode());
        project.setTitle(request.getTitle());
        project.setProjectType(request.getProjectType());
        project.setBookingStatus(request.getBookingStatus());
        project.setPaymentStatus(request.getPaymentStatus());
        project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setNotes(request.getNotes());

        when(projectRepository.save(any(Project.class))).thenReturn(project);

        ProjectResponse response = projectService.createProject(request);

        assertNotNull(response);
        assertEquals(project.getId(), response.getId());
        assertEquals("RSA-2026-0001", response.getProjectCode());
        assertEquals("Corp Portrait", response.getTitle());
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void createProject_InvalidClientId_ThrowsException() {
        ProjectCreateRequest request = new ProjectCreateRequest(
                clientId, managerId, "RSA-2026-0001", "Corp Portrait", "Corporate",
                BookingStatus.INQUIRY, PaymentStatus.UNPAID, ProjectStatus.LEAD,
                null, null, null
        );

        when(clientRepository.existsById(clientId)).thenReturn(false);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> projectService.createProject(request));
        assertTrue(exception.getMessage().contains("Client not found with id"));
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void createProject_DuplicateProjectCode_ThrowsException() {
        ProjectCreateRequest request = new ProjectCreateRequest(
                clientId, managerId, "RSA-2026-0001", "Corp Portrait", "Corporate",
                BookingStatus.INQUIRY, PaymentStatus.UNPAID, ProjectStatus.LEAD,
                null, null, null
        );

        when(clientRepository.existsById(clientId)).thenReturn(true);
        when(projectRepository.findByProjectCode("RSA-2026-0001")).thenReturn(Optional.of(new Project()));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> projectService.createProject(request));
        assertTrue(exception.getMessage().contains("Project code already exists"));
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void createProject_InvalidDateRange_ThrowsException() {
        ProjectCreateRequest request = new ProjectCreateRequest(
                clientId, managerId, "RSA-2026-0001", "Corp Portrait", "Corporate",
                BookingStatus.INQUIRY, PaymentStatus.UNPAID, ProjectStatus.LEAD,
                LocalDate.of(2026, 6, 15), LocalDate.of(2026, 6, 1), null
        );

        when(clientRepository.existsById(clientId)).thenReturn(true);
        when(projectRepository.findByProjectCode("RSA-2026-0001")).thenReturn(Optional.empty());

        Exception exception = assertThrows(IllegalArgumentException.class, () -> projectService.createProject(request));
        assertTrue(exception.getMessage().contains("Start date cannot be after end date"));
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void getProjectById_Success() {
        UUID id = UUID.randomUUID();
        Project project = new Project();
        project.setId(id);
        project.setProjectCode("PROJ1");
        project.setTitle("Project One");

        when(projectRepository.findById(id)).thenReturn(Optional.of(project));

        ProjectResponse response = projectService.getProjectById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("PROJ1", response.getProjectCode());
    }

    @Test
    void getProjectById_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(projectRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> projectService.getProjectById(id));
    }

    @Test
    void updateProject_Success() {
        UUID id = UUID.randomUUID();
        Project project = new Project();
        project.setId(id);
        project.setProjectCode("RSA-2026-0001");
        project.setClientId(clientId);

        ProjectUpdateRequest request = new ProjectUpdateRequest(
                clientId, managerId, "RSA-2026-0002", "Corp Portrait Updated", "Corporate",
                BookingStatus.FULLY_BOOKED, PaymentStatus.FULLY_PAID, ProjectStatus.CONFIRMED,
                LocalDate.of(2026, 6, 2), LocalDate.of(2026, 6, 16), "Updated notes"
        );

        when(projectRepository.findById(id)).thenReturn(Optional.of(project));
        when(clientRepository.existsById(clientId)).thenReturn(true);
        when(projectRepository.findByProjectCode("RSA-2026-0002")).thenReturn(Optional.empty());
        when(projectRepository.save(any(Project.class))).thenReturn(project);

        ProjectResponse response = projectService.updateProject(id, request);

        assertNotNull(response);
        assertEquals("RSA-2026-0002", response.getProjectCode());
        assertEquals("Corp Portrait Updated", response.getTitle());
    }

    @Test
    void updateProject_DuplicateProjectCode_ThrowsException() {
        UUID id = UUID.randomUUID();
        Project project = new Project();
        project.setId(id);
        project.setProjectCode("RSA-2026-0001");
        project.setClientId(clientId);

        ProjectUpdateRequest request = new ProjectUpdateRequest(
                clientId, managerId, "RSA-2026-0002", "Corp Portrait Updated", "Corporate",
                null, null, null, null, null, null
        );

        Project anotherProject = new Project();
        anotherProject.setId(UUID.randomUUID());
        anotherProject.setProjectCode("RSA-2026-0002");

        when(projectRepository.findById(id)).thenReturn(Optional.of(project));
        when(clientRepository.existsById(clientId)).thenReturn(true);
        when(projectRepository.findByProjectCode("RSA-2026-0002")).thenReturn(Optional.of(anotherProject));

        assertThrows(IllegalArgumentException.class, () -> projectService.updateProject(id, request));
    }

    @Test
    void deleteProject_Success() {
        UUID id = UUID.randomUUID();
        Project project = new Project();
        project.setId(id);

        when(projectRepository.findById(id)).thenReturn(Optional.of(project));
        doNothing().when(projectRepository).delete(project);

        assertDoesNotThrow(() -> projectService.deleteProject(id));
        verify(projectRepository, times(1)).delete(project);
    }

    @Test
    void deleteProject_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(projectRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> projectService.deleteProject(id));
    }

    @Test
    void listProjects_NoSearch_ReturnsAll() {
        Project p1 = new Project();
        p1.setProjectCode("P1");
        Project p2 = new Project();
        p2.setProjectCode("P2");

        when(projectRepository.findAll()).thenReturn(List.of(p1, p2));

        List<ProjectResponse> responses = projectService.listProjects(null);

        assertEquals(2, responses.size());
        verify(projectRepository, times(1)).findAll();
    }

    @Test
    void listProjects_WithSearch_ReturnsMatching() {
        Project p1 = new Project();
        p1.setProjectCode("RSA-2026-0001");

        when(projectRepository.searchProjects("RSA")).thenReturn(List.of(p1));

        List<ProjectResponse> responses = projectService.listProjects("RSA");

        assertEquals(1, responses.size());
        assertEquals("RSA-2026-0001", responses.get(0).getProjectCode());
        verify(projectRepository, times(1)).searchProjects("RSA");
    }
}
