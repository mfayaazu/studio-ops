package com.studioops.assignment;

import com.studioops.employee.Employee;
import com.studioops.employee.EmployeeRepository;
import com.studioops.event.Event;
import com.studioops.event.EventRepository;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import com.studioops.assignment.dto.EventAssignmentCreateRequest;
import com.studioops.assignment.dto.EventAssignmentResponse;
import com.studioops.assignment.dto.EventAssignmentUpdateRequest;

@Service
@Transactional
public class EventAssignmentService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final EventAssignmentRepository eventAssignmentRepository;
    private final EventRepository eventRepository;
    private final EmployeeRepository employeeRepository;
    private final StudioRepository studioRepository;
    private final TenantContext tenantContext;

    public EventAssignmentService(EventAssignmentRepository eventAssignmentRepository,
                                  EventRepository eventRepository,
                                  EmployeeRepository employeeRepository,
                                  StudioRepository studioRepository,
                                  TenantContext tenantContext) {
        this.eventAssignmentRepository = eventAssignmentRepository;
        this.eventRepository = eventRepository;
        this.employeeRepository = employeeRepository;
        this.studioRepository = studioRepository;
        this.tenantContext = tenantContext;
    }

    public EventAssignmentResponse createAssignment(EventAssignmentCreateRequest request) {
        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

        // Validate studio exists
        if (!studioRepository.existsById(studioId)) {
            throw new ResourceNotFoundException("Studio not found with id: " + studioId);
        }

        // Validate event exists and belongs to the same studio
        Event event = eventRepository.findByIdAndStudioId(request.getEventId(), studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + request.getEventId()));

        // Validate employee exists and belongs to the same studio
        Employee employee = employeeRepository.findByIdAndStudioId(request.getEmployeeId(), studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        EventAssignment assignment = new EventAssignment();
        assignment.setStudioId(studioId);
        assignment.setEventId(request.getEventId());
        assignment.setEmployeeId(request.getEmployeeId());
        assignment.setAssignmentRole(request.getAssignmentRole());
        assignment.setAssignmentStatus(request.getAssignmentStatus());
        assignment.setCallTime(request.getCallTime());
        assignment.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        EventAssignment saved = eventAssignmentRepository.save(assignment);

        return toResponseWithConflictCheck(saved, event, employee);
    }

    @Transactional(readOnly = true)
    public List<EventAssignmentResponse> listAssignments(UUID eventId, UUID employeeId) {
        List<EventAssignment> assignments;
        UUID studioId = tenantContext.getCurrentStudioId();
        if (eventId != null) {
            // Validate event belongs to studio
            eventRepository.findByIdAndStudioId(eventId, studioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
            assignments = eventAssignmentRepository.findByEventIdAndStudioId(eventId, studioId);
        } else if (employeeId != null) {
            // Validate employee belongs to studio
            employeeRepository.findByIdAndStudioId(employeeId, studioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));
            assignments = eventAssignmentRepository.findByEmployeeIdAndStudioId(employeeId, studioId);
        } else {
            assignments = eventAssignmentRepository.findAllByStudioId(studioId);
        }

        return assignments.stream()
                .map(this::toResponseWithConflictCheck)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventAssignmentResponse getAssignmentById(UUID id) {
        EventAssignment assignment = eventAssignmentRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
        return toResponseWithConflictCheck(assignment);
    }

    public EventAssignmentResponse updateAssignment(UUID id, EventAssignmentUpdateRequest request) {
        EventAssignment assignment = eventAssignmentRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));

        assignment.setAssignmentRole(request.getAssignmentRole());
        assignment.setAssignmentStatus(request.getAssignmentStatus());
        assignment.setCallTime(request.getCallTime());
        assignment.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        EventAssignment updated = eventAssignmentRepository.save(assignment);
        return toResponseWithConflictCheck(updated);
    }

    public void deleteAssignment(UUID id) {
        EventAssignment assignment = eventAssignmentRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
        eventAssignmentRepository.delete(assignment);
    }

    private EventAssignmentResponse toResponseWithConflictCheck(EventAssignment ea) {
        if (ea == null) {
            return null;
        }
        Event event = eventRepository.findByIdAndStudioId(ea.getEventId(), ea.getStudioId()).orElse(null);
        Employee employee = employeeRepository.findByIdAndStudioId(ea.getEmployeeId(), ea.getStudioId()).orElse(null);
        return toResponseWithConflictCheck(ea, event, employee);
    }

    private EventAssignmentResponse toResponseWithConflictCheck(EventAssignment ea, Event event, Employee employee) {
        if (ea == null) {
            return null;
        }

        // If the assignment status is CANCELLED or REJECTED, it cannot generate conflict warning
        if (ea.getAssignmentStatus() == AssignmentStatus.CANCELLED || ea.getAssignmentStatus() == AssignmentStatus.REJECTED) {
            return EventAssignmentMapper.toResponse(ea, false, null);
        }

        if (event == null || employee == null) {
            return EventAssignmentMapper.toResponse(ea, false, null);
        }

        // Check for overlaps with other non-cancelled/non-rejected assignments of this employee
        List<EventAssignment> overlaps = eventAssignmentRepository.findOverlappingAssignmentsByStudio(
                ea.getStudioId(),
                ea.getEmployeeId(),
                ea.getEventId(),
                event.getEventDate(),
                event.getStartTime(),
                event.getEndTime(),
                List.of(AssignmentStatus.CANCELLED, AssignmentStatus.REJECTED)
        );

        if (!overlaps.isEmpty()) {
            EventAssignment conflictAssignment = overlaps.get(0);
            Event conflictEvent = eventRepository.findByIdAndStudioId(conflictAssignment.getEventId(), ea.getStudioId()).orElse(null);
            String conflictEventTitle = conflictEvent != null ? conflictEvent.getTitle() : "Other Event";
            String startTimeStr = conflictEvent != null ? conflictEvent.getStartTime().format(TIME_FORMATTER) : "00:00";
            String endTimeStr = conflictEvent != null ? conflictEvent.getEndTime().format(TIME_FORMATTER) : "00:00";

            String reason = String.format("Employee %s is already assigned to '%s' from %s to %s on %s.",
                    employee.getFullName(),
                    conflictEventTitle,
                    startTimeStr,
                    endTimeStr,
                    event.getEventDate().toString()
            );

            return EventAssignmentMapper.toResponse(ea, true, reason);
        }

        return EventAssignmentMapper.toResponse(ea, false, null);
    }
}
