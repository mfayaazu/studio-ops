package com.studioops.assignment;

import com.studioops.common.tenant.TenantContext;
import com.studioops.common.tenant.TenantConstants;

import com.studioops.employee.Employee;
import com.studioops.employee.EmployeeRepository;
import com.studioops.employee.EmployeeStatus;
import com.studioops.event.Event;
import com.studioops.event.EventRepository;
import com.studioops.event.EventStatus;
import com.studioops.event.EventType;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.studio.StudioRepository;
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
    private TenantContext tenantContext;


    @Mock
    private EventAssignmentRepository eventAssignmentRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private StudioRepository studioRepository;

    @InjectMocks
    private EventAssignmentService eventAssignmentService;

    private UUID eventId;
    private UUID employeeId;
    private Event event;
    private Employee employee;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(tenantContext.getCurrentStudioId()).thenReturn(TenantConstants.DEFAULT_STUDIO_ID);
        eventId = UUID.randomUUID();
        employeeId = UUID.randomUUID();

        event = new Event();
        event.setId(eventId);
        event.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        event.setProjectId(UUID.randomUUID());
        event.setTitle("Wedding Shoot");
        event.setType(EventType.WEDDING);
        event.setEventDate(LocalDate.of(2026, 6, 5));
        event.setStartTime(LocalTime.of(9, 0));
        event.setEndTime(LocalTime.of(17, 0));

        employee = new Employee();
        employee.setId(employeeId);
        employee.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        employee.setFullName("John Doe");
        employee.setEmail("john.doe@studioops.se");
        employee.setPrimaryRole("Photographer");
        employee.setStatus(EmployeeStatus.ACTIVE);

        lenient().when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
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

        when(eventRepository.findByIdAndStudioId(eventId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(event));
        when(employeeRepository.findByIdAndStudioId(employeeId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(employee));
        when(eventAssignmentRepository.findOverlappingAssignmentsByStudio(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of());

        EventAssignment assignment = new EventAssignment();
        assignment.setId(UUID.randomUUID());
        assignment.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
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
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
        assertFalse(response.isConflictWarning());
        assertNull(response.getConflictReason());
        verify(eventAssignmentRepository, times(1)).save(any(EventAssignment.class));
    }

    @Test
    void createAssignment_DefaultsToDefaultStudio_WhenStudioIdMissing() {
        EventAssignmentCreateRequest request = new EventAssignmentCreateRequest();
        request.setEventId(eventId);
        request.setEmployeeId(employeeId);
        request.setAssignmentRole(AssignmentRole.CANDID_PHOTOGRAPHER);
        request.setAssignmentStatus(AssignmentStatus.PROPOSED);

        when(eventRepository.findByIdAndStudioId(eventId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(event));
        when(employeeRepository.findByIdAndStudioId(employeeId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(employee));
        when(eventAssignmentRepository.findOverlappingAssignmentsByStudio(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of());

        EventAssignment assignment = new EventAssignment();
        assignment.setId(UUID.randomUUID());
        assignment.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        assignment.setEventId(eventId);
        assignment.setEmployeeId(employeeId);
        assignment.setAssignmentRole(request.getAssignmentRole());
        assignment.setAssignmentStatus(request.getAssignmentStatus());

        when(eventAssignmentRepository.save(any(EventAssignment.class))).thenReturn(assignment);

        EventAssignmentResponse response = eventAssignmentService.createAssignment(request);

        assertNotNull(response);
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
    }

    @Test
    void createAssignment_Fails_WhenStudioIdDoesNotExist() {
        UUID nonExistentStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(nonExistentStudioId);
        EventAssignmentCreateRequest request = new EventAssignmentCreateRequest();
        request.setStudioId(nonExistentStudioId);
        request.setEventId(eventId);
        request.setEmployeeId(employeeId);
        request.setAssignmentRole(AssignmentRole.CANDID_PHOTOGRAPHER);
        request.setAssignmentStatus(AssignmentStatus.PROPOSED);

        when(studioRepository.existsById(nonExistentStudioId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> eventAssignmentService.createAssignment(request));
        verify(eventAssignmentRepository, never()).save(any(EventAssignment.class));
    }

    @Test
    void createAssignment_Fails_WhenEventIdDoesNotBelongToSameStudio() {
        UUID customStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(customStudioId);
        EventAssignmentCreateRequest request = new EventAssignmentCreateRequest();
        request.setStudioId(customStudioId);
        request.setEventId(eventId);
        request.setEmployeeId(employeeId);
        request.setAssignmentRole(AssignmentRole.CANDID_PHOTOGRAPHER);
        request.setAssignmentStatus(AssignmentStatus.PROPOSED);

        // Event returned belongs to DEFAULT_STUDIO_ID, but request is for customStudioId
        when(eventRepository.findByIdAndStudioId(eventId, customStudioId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> eventAssignmentService.createAssignment(request));
        verify(eventAssignmentRepository, never()).save(any(EventAssignment.class));
    }

    @Test
    void createAssignment_Fails_WhenEmployeeIdDoesNotBelongToSameStudio() {
        UUID customStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(customStudioId);
        EventAssignmentCreateRequest request = new EventAssignmentCreateRequest();
        request.setStudioId(customStudioId);
        request.setEventId(eventId);
        request.setEmployeeId(employeeId);
        request.setAssignmentRole(AssignmentRole.CANDID_PHOTOGRAPHER);
        request.setAssignmentStatus(AssignmentStatus.PROPOSED);

        Event customEvent = new Event();
        customEvent.setId(eventId);
        customEvent.setStudioId(customStudioId);

        when(eventRepository.findByIdAndStudioId(eventId, customStudioId)).thenReturn(Optional.of(customEvent));
        // Employee belongs to DEFAULT_STUDIO_ID, so looking up in customStudioId returns empty
        when(employeeRepository.findByIdAndStudioId(employeeId, customStudioId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> eventAssignmentService.createAssignment(request));
        verify(eventAssignmentRepository, never()).save(any(EventAssignment.class));
    }

    @Test
    void createAssignment_ConflictDetected_StudioScoped() {
        EventAssignmentCreateRequest request = new EventAssignmentCreateRequest();
        request.setEventId(eventId);
        request.setEmployeeId(employeeId);
        request.setAssignmentRole(AssignmentRole.CANDID_PHOTOGRAPHER);
        request.setAssignmentStatus(AssignmentStatus.PROPOSED);

        when(eventRepository.findByIdAndStudioId(eventId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(event));
        when(employeeRepository.findByIdAndStudioId(employeeId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(employee));

        // Create overlapping assignment & event details
        UUID otherEventId = UUID.randomUUID();
        EventAssignment overlapAssignment = new EventAssignment();
        overlapAssignment.setId(UUID.randomUUID());
        overlapAssignment.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        overlapAssignment.setEventId(otherEventId);
        overlapAssignment.setEmployeeId(employeeId);
        overlapAssignment.setAssignmentStatus(AssignmentStatus.ACCEPTED);

        Event otherEvent = new Event();
        otherEvent.setId(otherEventId);
        otherEvent.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        otherEvent.setTitle("Product Promo");
        otherEvent.setEventDate(LocalDate.of(2026, 6, 5));
        otherEvent.setStartTime(LocalTime.of(8, 0));
        otherEvent.setEndTime(LocalTime.of(12, 0));

        when(eventAssignmentRepository.findOverlappingAssignmentsByStudio(eq(TenantConstants.DEFAULT_STUDIO_ID), eq(employeeId), eq(eventId), eq(event.getEventDate()), eq(event.getStartTime()), eq(event.getEndTime()), any()))
                .thenReturn(List.of(overlapAssignment));
        when(eventRepository.findByIdAndStudioId(otherEventId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(otherEvent));

        EventAssignment assignment = new EventAssignment();
        assignment.setId(UUID.randomUUID());
        assignment.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
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
    void listAssignments_FilterByEvent_StudioScoped() {
        when(eventRepository.findByIdAndStudioId(eventId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(event));
        EventAssignment assignment = new EventAssignment();
        assignment.setId(UUID.randomUUID());
        assignment.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        assignment.setEventId(eventId);
        assignment.setEmployeeId(employeeId);
        assignment.setAssignmentStatus(AssignmentStatus.ACCEPTED);

        when(eventAssignmentRepository.findByEventIdAndStudioId(eventId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(List.of(assignment));
        when(employeeRepository.findByIdAndStudioId(employeeId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(employee));

        List<EventAssignmentResponse> results = eventAssignmentService.listAssignments(eventId, null);
        assertEquals(1, results.size());
        assertEquals(assignment.getId(), results.get(0).getId());
    }

    @Test
    void listAssignments_FilterByEmployee_StudioScoped() {
        when(employeeRepository.findByIdAndStudioId(employeeId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(employee));
        EventAssignment assignment = new EventAssignment();
        assignment.setId(UUID.randomUUID());
        assignment.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        assignment.setEventId(eventId);
        assignment.setEmployeeId(employeeId);
        assignment.setAssignmentStatus(AssignmentStatus.ACCEPTED);

        when(eventAssignmentRepository.findByEmployeeIdAndStudioId(employeeId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(List.of(assignment));
        when(eventRepository.findByIdAndStudioId(eventId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(event));

        List<EventAssignmentResponse> results = eventAssignmentService.listAssignments(null, employeeId);
        assertEquals(1, results.size());
        assertEquals(assignment.getId(), results.get(0).getId());
    }

    @Test
    void getAssignmentById_Success() {
        UUID id = UUID.randomUUID();
        EventAssignment assignment = new EventAssignment();
        assignment.setId(id);
        assignment.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        assignment.setEventId(eventId);
        assignment.setEmployeeId(employeeId);
        assignment.setAssignmentStatus(AssignmentStatus.ACCEPTED);

        when(eventAssignmentRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(assignment));
        when(eventRepository.findByIdAndStudioId(eventId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(event));
        when(employeeRepository.findByIdAndStudioId(employeeId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(employee));
        when(eventAssignmentRepository.findOverlappingAssignmentsByStudio(any(), any(), any(), any(), any(), any(), any()))
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
        assignment.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        assignment.setEventId(eventId);
        assignment.setEmployeeId(employeeId);
        assignment.setAssignmentRole(AssignmentRole.ASSISTANT);
        assignment.setAssignmentStatus(AssignmentStatus.PROPOSED);

        EventAssignmentUpdateRequest request = new EventAssignmentUpdateRequest();
        request.setAssignmentRole(AssignmentRole.CANDID_PHOTOGRAPHER);
        request.setAssignmentStatus(AssignmentStatus.ACCEPTED);
        request.setCallTime(LocalTime.of(8, 0));
        request.setNotes("Updated notes");

        when(eventAssignmentRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(assignment));
        when(eventRepository.findByIdAndStudioId(eventId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(event));
        when(employeeRepository.findByIdAndStudioId(employeeId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(employee));
        when(eventAssignmentRepository.findOverlappingAssignmentsByStudio(any(), any(), any(), any(), any(), any(), any()))
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
        assignment.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(eventAssignmentRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(assignment));
        doNothing().when(eventAssignmentRepository).delete(assignment);

        assertDoesNotThrow(() -> eventAssignmentService.deleteAssignment(id));
        verify(eventAssignmentRepository, times(1)).delete(assignment);
    }
}
