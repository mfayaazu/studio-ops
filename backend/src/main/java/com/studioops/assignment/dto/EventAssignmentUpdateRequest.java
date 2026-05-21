package com.studioops.assignment.dto;
import com.studioops.assignment.AssignmentRole;
import com.studioops.assignment.AssignmentStatus;

import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public class EventAssignmentUpdateRequest {

    @NotNull(message = "Assignment role is required")
    private AssignmentRole assignmentRole;

    @NotNull(message = "Assignment status is required")
    private AssignmentStatus assignmentStatus;

    private LocalTime callTime;
    private String notes;

    public EventAssignmentUpdateRequest() {
    }

    public AssignmentRole getAssignmentRole() {
        return assignmentRole;
    }

    public void setAssignmentRole(AssignmentRole assignmentRole) {
        this.assignmentRole = assignmentRole;
    }

    public AssignmentStatus getAssignmentStatus() {
        return assignmentStatus;
    }

    public void setAssignmentStatus(AssignmentStatus assignmentStatus) {
        this.assignmentStatus = assignmentStatus;
    }

    public LocalTime getCallTime() {
        return callTime;
    }

    public void setCallTime(LocalTime callTime) {
        this.callTime = callTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
