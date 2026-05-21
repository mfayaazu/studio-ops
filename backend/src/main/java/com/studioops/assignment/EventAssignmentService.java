package com.studioops.assignment;

import com.studioops.employee.Employee;
import com.studioops.employee.EmployeeRepository;
import com.studioops.event.Event;
import com.studioops.event.EventRepository;
import com.studioops.common.exception.ResourceNotFoundException;
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

    public EventAssignmentService(EventAssignmentRepository eventAssignmentRepository,
                                  EventRepository eventRepository,
                                  EmployeeRepository employeeRepository) {
        this.eventAssignmentRepository = eventAssignmentRepository;
        this.eventRepository = eventRepository;
        this.employeeRepository = employeeRepository;
    }

    public EventAssignmentResponse createAssignment(EventAssignmentCreateRequest request) {
        // Validate event exists
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + request.getEventId()));

        // Validate employee exists
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        EventAssignment assignment = new EventAssignment();
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
        if (eventId != null) {
            assignments = eventAssignmentRepository.findByEventId(eventId);
        } else if (employeeId != null) {
            assignments = eventAssignmentRepository.findByEmployeeId(employeeId);
        } else {
            assignments = eventAssignmentRepository.findAll();
        }

        return assignments.stream()
                .map(this::toResponseWithConflictCheck)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventAssignmentResponse getAssignmentById(UUID id) {
        EventAssignment assignment = eventAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
        return toResponseWithConflictCheck(assignment);
    }

    public EventAssignmentResponse updateAssignment(UUID id, EventAssignmentUpdateRequest request) {
        EventAssignment assignment = eventAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));

        assignment.setAssignmentRole(request.getAssignmentRole());
        assignment.setAssignmentStatus(request.getAssignmentStatus());
        assignment.setCallTime(request.getCallTime());
        assignment.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        EventAssignment updated = eventAssignmentRepository.save(assignment);
        return toResponseWithConflictCheck(updated);
    }

    public void deleteAssignment(UUID id) {
        EventAssignment assignment = eventAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
        eventAssignmentRepository.delete(assignment);
    }

    private EventAssignmentResponse toResponseWithConflictCheck(EventAssignment ea) {
        if (ea == null) {
            return null;
        }
        Event event = eventRepository.findById(ea.getEventId()).orElse(null);
        Employee employee = employeeRepository.findById(ea.getEmployeeId()).orElse(null);
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
        List<EventAssignment> overlaps = eventAssignmentRepository.findOverlappingAssignments(
                ea.getEmployeeId(),
                ea.getEventId(),
                event.getEventDate(),
                event.getStartTime(),
                event.getEndTime(),
                List.of(AssignmentStatus.CANCELLED, AssignmentStatus.REJECTED)
        );

        if (!overlaps.isEmpty()) {
            EventAssignment conflictAssignment = overlaps.get(0);
            Event conflictEvent = eventRepository.findById(conflictAssignment.getEventId()).orElse(null);
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
