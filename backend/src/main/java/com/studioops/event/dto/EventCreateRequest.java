package com.studioops.event.dto;
import com.studioops.event.EventStatus;
import com.studioops.event.EventType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class EventCreateRequest {

    @NotNull(message = "projectId is required")
    private UUID projectId;

    @NotBlank(message = "title is required")
    @Size(max = 255, message = "title must not exceed 255 characters")
    private String title;

    @NotNull(message = "type is required")
    private EventType type;

    @NotNull(message = "eventDate is required")
    private LocalDate eventDate;

    @NotNull(message = "startTime is required")
    private LocalTime startTime;

    @NotNull(message = "endTime is required")
    private LocalTime endTime;

    @NotBlank(message = "venueName is required")
    @Size(max = 255, message = "venueName must not exceed 255 characters")
    private String venueName;

    @NotBlank(message = "city is required")
    @Size(max = 100, message = "city must not exceed 100 characters")
    private String city;

    @NotBlank(message = "address is required")
    @Size(max = 500, message = "address must not exceed 500 characters")
    private String address;

    private EventStatus status;
    private String notes;

    public EventCreateRequest() {
    }

    public EventCreateRequest(UUID projectId, String title, EventType type, LocalDate eventDate,
                              LocalTime startTime, LocalTime endTime, String venueName, String city,
                              String address, EventStatus status, String notes) {
        this.projectId = projectId;
        this.title = title;
        this.type = type;
        this.eventDate = eventDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.venueName = venueName;
        this.city = city;
        this.address = address;
        this.status = status;
        this.notes = notes;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public EventType getType() {
        return type;
    }

    public void setType(EventType type) {
        this.type = type;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
