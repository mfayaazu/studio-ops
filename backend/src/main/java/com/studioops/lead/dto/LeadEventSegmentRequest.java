package com.studioops.lead.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class LeadEventSegmentRequest {

    private UUID id;

    @NotBlank(message = "eventType is required")
    private String eventType;

    private String eventName;

    @NotNull(message = "eventDate is required")
    private LocalDate eventDate;

    private LocalTime startTime;
    private LocalTime endTime;

    @NotBlank(message = "venueName is required")
    private String venueName = "TBD";

    private String address;

    @NotBlank(message = "city is required")
    private String city = "TBD";

    private String notes;

    public LeadEventSegmentRequest() {
    }

    public LeadEventSegmentRequest(UUID id, String eventType, String eventName, LocalDate eventDate, LocalTime startTime, LocalTime endTime, String venueName, String address, String city, String notes) {
        this.id = id;
        this.eventType = eventType;
        this.eventName = eventName;
        this.eventDate = eventDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.venueName = venueName;
        this.address = address;
        this.city = city;
        this.notes = notes;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
