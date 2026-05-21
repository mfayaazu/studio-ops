package com.studioops.assignment;

public class EventAssignmentMapper {

    public static EventAssignmentResponse toResponse(EventAssignment assignment, boolean conflictWarning, String conflictReason) {
        if (assignment == null) {
            return null;
        }
        EventAssignmentResponse response = new EventAssignmentResponse();
        response.setId(assignment.getId());
        response.setEventId(assignment.getEventId());
        response.setEmployeeId(assignment.getEmployeeId());
        response.setAssignmentRole(assignment.getAssignmentRole());
        response.setAssignmentStatus(assignment.getAssignmentStatus());
        response.setCallTime(assignment.getCallTime());
        response.setNotes(assignment.getNotes());
        response.setConflictWarning(conflictWarning);
        response.setConflictReason(conflictReason);
        response.setCreatedAt(assignment.getCreatedAt());
        response.setUpdatedAt(assignment.getUpdatedAt());
        return response;
    }
}
