package com.studioops.assignment;

import com.studioops.employee.Employee;
import com.studioops.employee.EmployeeRepository;
import com.studioops.employee.EmployeeStatus;
import com.studioops.event.Event;
import com.studioops.event.EventRepository;
import com.studioops.event.EventStatus;
import com.studioops.event.EventType;
import com.studioops.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import com.studioops.assignment.dto.EventAssignmentCreateRequest;
import com.studioops.assignment.dto.EventAssignmentResponse;
import com.studioops.assignment.dto.EventAssignmentUpdateRequest;

class EventAssignmentServiceTest {

    @Mock
    private EventAssignmentRepository eventAssignmentRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EventAssignmentService eventAssignmentService;

    private UUID eventId;
    private UUID employeeId;
    private Event event;
    private Employee employee;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        eventId = UUID.randomUUID();
        employeeId = UUID.randomUUID();

        event = new Event();
        event.setId(eventId);
        event.setProjectId(UUID.randomUUID());
        event.setTitle("Wedding Shoot");
        event.setType(EventType.WEDDING);
        event.setEventDate(LocalDate.of(2026, 6, 5));
        event.setStartTime(LocalTime.of(9, 0));
        event.setEndTime(LocalTime.of(17, 0));

        employee = new Employee();
        employee.setId(employeeId);
        employee.setFullName("John Doe");
        employee.setEmail("john.doe@studioops.se");
        employee.setPrimaryRole("Photographer");
        employee.setStatus(EmployeeStatus.ACTIVE);
    }

    @Test
    void createAssignment_Success_NoConflict() {
        EventAssignmentCreateRequest request = new EventAssignmentCreateRequest();
        request.setEventId(eventId);
        request.setEmployeeId(employeeId);
        request.setAssignmentRole(AssignmentRole.CANDID_PHOTOGRAPHER);
        request.setAssignmentStatus(AssignmentStatus.PROPOSED);
        request.setCallTime(LocalTime.of(8, 30));
        request.setNotes("Backup camera body");

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(eventAssignmentRepository.findOverlappingAssignments(any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of());

        EventAssignment assignment = new EventAssignment();
        assignment.setId(UUID.randomUUID());
        assignment.setEventId(eventId);
        assignment.setEmployeeId(employeeId);
        assignment.setAssignmentRole(request.getAssignmentRole());
        assignment.setAssignmentStatus(request.getAssignmentStatus());
        assignment.setCallTime(request.getCallTime());
        assignment.setNotes(request.getNotes());

        when(eventAssignmentRepository.save(any(EventAssignment.class))).thenReturn(assignment);

        EventAssignmentResponse response = eventAssignmentService.createAssignment(request);

        assertNotNull(response);
        assertEquals(assignment.getId(), response.getId());
        assertFalse(response.isConflictWarning());
        assertNull(response.getConflictReason());
        verify(eventAssignmentRepository, times(1)).save(any(EventAssignment.class));
    }

    @Test
    void createAssignment_EventNotFound_ThrowsException() {
        EventAssignmentCreateRequest request = new EventAssignmentCreateRequest();
        request.setEventId(eventId);
        request.setEmployeeId(employeeId);

        when(eventRepository.findById(eventId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> eventAssignmentService.createAssignment(request));
        verify(eventAssignmentRepository, never()).save(any(EventAssignment.class));
    }

    @Test
    void createAssignment_EmployeeNotFound_ThrowsException() {
        EventAssignmentCreateRequest request = new EventAssignmentCreateRequest();
        request.setEventId(eventId);
        request.setEmployeeId(employeeId);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> eventAssignmentService.createAssignment(request));
        verify(eventAssignmentRepository, never()).save(any(EventAssignment.class));
    }

    @Test
    void createAssignment_ConflictDetected() {
        EventAssignmentCreateRequest request = new EventAssignmentCreateRequest();
        request.setEventId(eventId);
        request.setEmployeeId(employeeId);
        request.setAssignmentRole(AssignmentRole.CANDID_PHOTOGRAPHER);
        request.setAssignmentStatus(AssignmentStatus.PROPOSED);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));

        // Create overlapping assignment & event details
        UUID otherEventId = UUID.randomUUID();
        EventAssignment overlapAssignment = new EventAssignment();
        overlapAssignment.setId(UUID.randomUUID());
        overlapAssignment.setEventId(otherEventId);
        overlapAssignment.setEmployeeId(employeeId);
        overlapAssignment.setAssignmentStatus(AssignmentStatus.ACCEPTED);

        Event otherEvent = new Event();
        otherEvent.setId(otherEventId);
        otherEvent.setTitle("Product Promo");
        otherEvent.setEventDate(LocalDate.of(2026, 6, 5));
        otherEvent.setStartTime(LocalTime.of(8, 0));
        otherEvent.setEndTime(LocalTime.of(12, 0));

        when(eventAssignmentRepository.findOverlappingAssignments(eq(employeeId), eq(eventId), eq(event.getEventDate()), eq(event.getStartTime()), eq(event.getEndTime()), any()))
                .thenReturn(List.of(overlapAssignment));
        when(eventRepository.findById(otherEventId)).thenReturn(Optional.of(otherEvent));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));

        EventAssignment assignment = new EventAssignment();
        assignment.setId(UUID.randomUUID());
        assignment.setEventId(eventId);
        assignment.setEmployeeId(employeeId);
        assignment.setAssignmentRole(request.getAssignmentRole());
        assignment.setAssignmentStatus(request.getAssignmentStatus());

        when(eventAssignmentRepository.save(any(EventAssignment.class))).thenReturn(assignment);

        EventAssignmentResponse response = eventAssignmentService.createAssignment(request);

        assertNotNull(response);
        assertTrue(response.isConflictWarning());
        assertEquals("Employee John Doe is already assigned to 'Product Promo' from 08:00 to 12:00 on 2026-06-05.", response.getConflictReason());
    }

    @Test
    void createAssignment_CancelledStatus_NoConflictChecked() {
        EventAssignmentCreateRequest request = new EventAssignmentCreateRequest();
        request.setEventId(eventId);
        request.setEmployeeId(employeeId);
        request.setAssignmentRole(AssignmentRole.CANDID_PHOTOGRAPHER);
        request.setAssignmentStatus(AssignmentStatus.CANCELLED);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));

        EventAssignment assignment = new EventAssignment();
        assignment.setId(UUID.randomUUID());
        assignment.setEventId(eventId);
        assignment.setEmployeeId(employeeId);
        assignment.setAssignmentRole(request.getAssignmentRole());
        assignment.setAssignmentStatus(AssignmentStatus.CANCELLED);

        when(eventAssignmentRepository.save(any(EventAssignment.class))).thenReturn(assignment);

        EventAssignmentResponse response = eventAssignmentService.createAssignment(request);

        assertNotNull(response);
        assertFalse(response.isConflictWarning());
        verify(eventAssignmentRepository, never()).findOverlappingAssignments(any(), any(), any(), any(), any(), any());
    }

    @Test
    void getAssignmentById_Success() {
        UUID id = UUID.randomUUID();
        EventAssignment assignment = new EventAssignment();
        assignment.setId(id);
        assignment.setEventId(eventId);
        assignment.setEmployeeId(employeeId);
        assignment.setAssignmentStatus(AssignmentStatus.ACCEPTED);

        when(eventAssignmentRepository.findById(id)).thenReturn(Optional.of(assignment));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(eventAssignmentRepository.findOverlappingAssignments(any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of());

        EventAssignmentResponse response = eventAssignmentService.getAssignmentById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
    }

    @Test
    void updateAssignment_Success() {
        UUID id = UUID.randomUUID();
        EventAssignment assignment = new EventAssignment();
        assignment.setId(id);
        assignment.setEventId(eventId);
        assignment.setEmployeeId(employeeId);
        assignment.setAssignmentRole(AssignmentRole.ASSISTANT);
        assignment.setAssignmentStatus(AssignmentStatus.PROPOSED);

        EventAssignmentUpdateRequest request = new EventAssignmentUpdateRequest();
        request.setAssignmentRole(AssignmentRole.CANDID_PHOTOGRAPHER);
        request.setAssignmentStatus(AssignmentStatus.ACCEPTED);
        request.setCallTime(LocalTime.of(8, 0));
        request.setNotes("Updated notes");

        when(eventAssignmentRepository.findById(id)).thenReturn(Optional.of(assignment));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(eventAssignmentRepository.findOverlappingAssignments(any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of());
        when(eventAssignmentRepository.save(any(EventAssignment.class))).thenReturn(assignment);

        EventAssignmentResponse response = eventAssignmentService.updateAssignment(id, request);

        assertNotNull(response);
        assertEquals(AssignmentRole.CANDID_PHOTOGRAPHER, response.getAssignmentRole());
        assertEquals(AssignmentStatus.ACCEPTED, response.getAssignmentStatus());
    }

    @Test
    void deleteAssignment_Success() {
        UUID id = UUID.randomUUID();
        EventAssignment assignment = new EventAssignment();
        assignment.setId(id);

        when(eventAssignmentRepository.findById(id)).thenReturn(Optional.of(assignment));
        doNothing().when(eventAssignmentRepository).delete(assignment);

        assertDoesNotThrow(() -> eventAssignmentService.deleteAssignment(id));
        verify(eventAssignmentRepository, times(1)).delete(assignment);
    }
}
