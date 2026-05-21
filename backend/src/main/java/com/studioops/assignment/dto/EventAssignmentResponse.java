package com.studioops.assignment.dto;
import com.studioops.assignment.AssignmentRole;
import com.studioops.assignment.AssignmentStatus;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

public class EventAssignmentResponse {

    private UUID id;
    private UUID eventId;
    private UUID employeeId;
    private AssignmentRole assignmentRole;
    private AssignmentStatus assignmentStatus;
    private LocalTime callTime;
    private String notes;
    private boolean conflictWarning;
    private String conflictReason;
    private Instant createdAt;
    private Instant updatedAt;

    public EventAssignmentResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getEventId() {
        return eventId;
    }

    public void setEventId(UUID eventId) {
        this.eventId = eventId;
    }

    public UUID getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(UUID employeeId) {
        this.employeeId = employeeId;
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

    public boolean isConflictWarning() {
        return conflictWarning;
    }

    public void setConflictWarning(boolean conflictWarning) {
        this.conflictWarning = conflictWarning;
    }

    public String getConflictReason() {
        return conflictReason;
    }

    public void setConflictReason(String conflictReason) {
        this.conflictReason = conflictReason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
