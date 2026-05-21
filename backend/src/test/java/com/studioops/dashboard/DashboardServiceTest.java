package com.studioops.dashboard;

import com.studioops.assignment.AssignmentStatus;
import com.studioops.assignment.EventAssignment;
import com.studioops.assignment.EventAssignmentRepository;
import com.studioops.backup.BackupLocationType;
import com.studioops.backup.BackupRecordRepository;
import com.studioops.backup.BackupStatus;
import com.studioops.client.ClientRepository;
import com.studioops.deliverable.Deliverable;
import com.studioops.deliverable.DeliverableRepository;
import com.studioops.employee.Employee;
import com.studioops.employee.EmployeeRepository;
import com.studioops.event.Event;
import com.studioops.event.EventRepository;
import com.studioops.event.EventStatus;
import com.studioops.project.Project;
import com.studioops.project.ProjectRepository;
import com.studioops.project.ProjectStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DashboardServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private BackupRecordRepository backupRecordRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EventAssignmentRepository eventAssignmentRepository;

    @Mock
    private DeliverableRepository deliverableRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getSummary_Success() {
        // Mock Statistics
        when(clientRepository.count()).thenReturn(10L);
        when(projectRepository.countByStatusNotIn(any())).thenReturn(5L);
        when(eventRepository.countByStatusAndEventDateGreaterThanEqual(eq(EventStatus.SCHEDULED), any(LocalDate.class))).thenReturn(3L);
        when(backupRecordRepository.countByStatus(BackupStatus.COMPLETED)).thenReturn(8L);

        // Mock Employees
        UUID empId = UUID.randomUUID();
        Employee employee = new Employee();
        employee.setId(empId);
        employee.setFullName("John Doe");
        when(employeeRepository.findAll()).thenReturn(List.of(employee));

        // Mock Events with an overlap
        UUID eventId1 = UUID.randomUUID();
        Event event1 = new Event();
        event1.setId(eventId1);
        event1.setTitle("Wedding Morning");
        event1.setEventDate(LocalDate.of(2026, 6, 5));
        event1.setStartTime(LocalTime.of(9, 0));
        event1.setEndTime(LocalTime.of(12, 0));

        UUID eventId2 = UUID.randomUUID();
        Event event2 = new Event();
        event2.setId(eventId2);
        event2.setTitle("Pre-Wedding Shoot");
        event2.setEventDate(LocalDate.of(2026, 6, 5));
        event2.setStartTime(LocalTime.of(10, 0));
        event2.setEndTime(LocalTime.of(14, 0));

        when(eventRepository.findAll()).thenReturn(List.of(event1, event2));

        // Mock Event Assignments
        EventAssignment assignment1 = new EventAssignment();
        assignment1.setId(UUID.randomUUID());
        assignment1.setEventId(eventId1);
        assignment1.setEmployeeId(empId);
        assignment1.setAssignmentStatus(AssignmentStatus.ACCEPTED);

        EventAssignment assignment2 = new EventAssignment();
        assignment2.setId(UUID.randomUUID());
        assignment2.setEventId(eventId2);
        assignment2.setEmployeeId(empId);
        assignment2.setAssignmentStatus(AssignmentStatus.PROPOSED);

        when(eventAssignmentRepository.findAll()).thenReturn(List.of(assignment1, assignment2));

        // Mock Projects
        UUID projectId = UUID.randomUUID();
        Project project = new Project();
        project.setId(projectId);
        project.setTitle("Project Alpha");
        when(projectRepository.findAll()).thenReturn(List.of(project));

        // Mock Deliverables
        UUID deliverableId = UUID.randomUUID();
        Deliverable deliverable = new Deliverable();
        deliverable.setId(deliverableId);
        deliverable.setProjectId(projectId);
        deliverable.setName("Main Edited Video");
        when(deliverableRepository.findAll()).thenReturn(List.of(deliverable));

        // Mock Backup Records completed location count
        when(backupRecordRepository.findDistinctCompletedLocationTypesByDeliverableId(deliverableId))
                .thenReturn(List.of(BackupLocationType.LOCAL_NAS));

        // Execute
        DashboardSummaryResponse response = dashboardService.getSummary();

        // Verify statistics
        assertNotNull(response);
        assertEquals(10L, response.getStats().getTotalClients());
        assertEquals(5L, response.getStats().getActiveProjects());
        assertEquals(3L, response.getStats().getUpcomingEventsCount());
        assertEquals(8L, response.getStats().getSuccessfulBackupsCount());

        // Verify Warnings
        assertEquals(1, response.getWarnings().size());
        DashboardWarning warning = response.getWarnings().get(0);
        assertEquals("DOUBLE_BOOKING", warning.getType());
        assertEquals(empId, warning.getEmployeeId());
        assertEquals("John Doe", warning.getEmployeeName());
        assertEquals("Wedding Morning", warning.getEventTitle());
        assertEquals("Pre-Wedding Shoot", warning.getOverlappingEventTitle());
        // Overlap of (09:00 - 12:00) and (10:00 - 14:00) is (10:00 - 12:00)
        assertEquals("2026-06-05T10:00:00Z to 2026-06-05T12:00:00Z", warning.getConflictTime());

        // Verify Backup Checklists
        assertEquals(1, response.getBackupChecklists().size());
        DashboardBackupChecklist checklist = response.getBackupChecklists().get(0);
        assertEquals(projectId, checklist.getProjectId());
        assertEquals("Project Alpha", checklist.getProjectName());
        assertEquals(deliverableId, checklist.getDeliverableId());
        assertEquals("Main Edited Video", checklist.getDeliverableName());
        assertEquals(1, checklist.getRedundantBackupCount());
        assertEquals("WARNING_LOW_REDUNDANCY", checklist.getStatus());
        assertEquals("Requires at least 2 distinct backup locations (current: LOCAL_NAS).", checklist.getDetails());
    }

    @Test
    void getSummary_NoOverlaps_SafeBackups() {
        // Mock Statistics
        when(clientRepository.count()).thenReturn(1L);
        when(projectRepository.countByStatusNotIn(any())).thenReturn(1L);
        when(eventRepository.countByStatusAndEventDateGreaterThanEqual(eq(EventStatus.SCHEDULED), any(LocalDate.class))).thenReturn(1L);
        when(backupRecordRepository.countByStatus(BackupStatus.COMPLETED)).thenReturn(2L);

        // Mock Employees
        UUID empId = UUID.randomUUID();
        Employee employee = new Employee();
        employee.setId(empId);
        employee.setFullName("Jane Doe");
        when(employeeRepository.findAll()).thenReturn(List.of(employee));

        // Mock Events
        UUID eventId1 = UUID.randomUUID();
        Event event1 = new Event();
        event1.setId(eventId1);
        event1.setTitle("Morning Ceremony");
        event1.setEventDate(LocalDate.of(2026, 6, 5));
        event1.setStartTime(LocalTime.of(9, 0));
        event1.setEndTime(LocalTime.of(12, 0));

        UUID eventId2 = UUID.randomUUID();
        Event event2 = new Event();
        event2.setId(eventId2);
        event2.setTitle("Evening Party");
        event2.setEventDate(LocalDate.of(2026, 6, 5));
        event2.setStartTime(LocalTime.of(18, 0)); // No overlap
        event2.setEndTime(LocalTime.of(22, 0));

        when(eventRepository.findAll()).thenReturn(List.of(event1, event2));

        // Mock Event Assignments
        EventAssignment assignment1 = new EventAssignment();
        assignment1.setId(UUID.randomUUID());
        assignment1.setEventId(eventId1);
        assignment1.setEmployeeId(empId);
        assignment1.setAssignmentStatus(AssignmentStatus.ACCEPTED);

        EventAssignment assignment2 = new EventAssignment();
        assignment2.setId(UUID.randomUUID());
        assignment2.setEventId(eventId2);
        assignment2.setEmployeeId(empId);
        assignment2.setAssignmentStatus(AssignmentStatus.ACCEPTED);

        when(eventAssignmentRepository.findAll()).thenReturn(List.of(assignment1, assignment2));

        // Mock Projects
        UUID projectId = UUID.randomUUID();
        Project project = new Project();
        project.setId(projectId);
        project.setTitle("Project Beta");
        when(projectRepository.findAll()).thenReturn(List.of(project));

        // Mock Deliverables
        UUID deliverableId = UUID.randomUUID();
        Deliverable deliverable = new Deliverable();
        deliverable.setId(deliverableId);
        deliverable.setProjectId(projectId);
        deliverable.setName("High Res JPGs");
        when(deliverableRepository.findAll()).thenReturn(List.of(deliverable));

        // Mock Backup Records: 2 completed locations -> SAFE
        when(backupRecordRepository.findDistinctCompletedLocationTypesByDeliverableId(deliverableId))
                .thenReturn(List.of(BackupLocationType.LOCAL_NAS, BackupLocationType.CLOUD_S3));

        // Execute
        DashboardSummaryResponse response = dashboardService.getSummary();

        // Verify
        assertNotNull(response);
        assertTrue(response.getWarnings().isEmpty());

        assertEquals(1, response.getBackupChecklists().size());
        DashboardBackupChecklist checklist = response.getBackupChecklists().get(0);
        assertEquals("SAFE", checklist.getStatus());
        assertEquals("Redundant backups verified (current: LOCAL_NAS, CLOUD_S3).", checklist.getDetails());
        assertEquals(2, checklist.getRedundantBackupCount());
    }
}
