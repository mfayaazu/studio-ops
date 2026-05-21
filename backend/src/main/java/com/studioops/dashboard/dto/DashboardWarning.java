package com.studioops.dashboard.dto;

import java.util.UUID;

public class DashboardWarning {
    private String type = "DOUBLE_BOOKING";
    private UUID employeeId;
    private String employeeName;
    private UUID eventId;
    private String eventTitle;
    private String overlappingEventTitle;
    private String conflictTime;

    public DashboardWarning() {
    }

    public DashboardWarning(String type, UUID employeeId, String employeeName, UUID eventId, String eventTitle, String overlappingEventTitle, String conflictTime) {
        this.type = type;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.overlappingEventTitle = overlappingEventTitle;
        this.conflictTime = conflictTime;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UUID getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(UUID employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public UUID getEventId() {
        return eventId;
    }

    public void setEventId(UUID eventId) {
        this.eventId = eventId;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }

    public String getOverlappingEventTitle() {
        return overlappingEventTitle;
    }

    public void setOverlappingEventTitle(String overlappingEventTitle) {
        this.overlappingEventTitle = overlappingEventTitle;
    }

    public String getConflictTime() {
        return conflictTime;
    }

    public void setConflictTime(String conflictTime) {
        this.conflictTime = conflictTime;
    }
}
