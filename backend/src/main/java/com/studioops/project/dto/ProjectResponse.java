package com.studioops.project.dto;

import com.studioops.project.BookingStatus;
import com.studioops.project.PaymentStatus;
import com.studioops.project.ProjectStatus;
import com.studioops.project.ProjectPriority;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class ProjectResponse {
    private UUID id;
    private UUID clientId;
    private UUID assignedProjectManagerId;
    private String projectCode;
    private String title;
    private String projectType;
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID studioId;

    private String projectSubtype;
    private String projectEvents;
    private BigDecimal projectBudget;
    private BigDecimal amountPaid;
    private String shootLocation;
    private String googleMapsLink;
    private LocalDate shootDate;
    private LocalTime shootStartTime;
    private LocalTime shootEndTime;
    private ProjectPriority priority;
    private String leadSource;

    public ProjectResponse() {
    }

    public ProjectResponse(UUID id, UUID clientId, UUID assignedProjectManagerId, String projectCode, String title,
                           String projectType, BookingStatus bookingStatus, PaymentStatus paymentStatus,
                           ProjectStatus status, LocalDate startDate, LocalDate endDate, String notes,
                           Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.clientId = clientId;
        this.assignedProjectManagerId = assignedProjectManagerId;
        this.projectCode = projectCode;
        this.title = title;
        this.projectType = projectType;
        this.bookingStatus = bookingStatus;
        this.paymentStatus = paymentStatus;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public ProjectResponse(UUID id, UUID clientId, UUID assignedProjectManagerId, String projectCode, String title,
                           String projectType, BookingStatus bookingStatus, PaymentStatus paymentStatus,
                           ProjectStatus status, LocalDate startDate, LocalDate endDate, String notes,
                           Instant createdAt, Instant updatedAt, UUID studioId) {
        this.id = id;
        this.clientId = clientId;
        this.assignedProjectManagerId = assignedProjectManagerId;
        this.projectCode = projectCode;
        this.title = title;
        this.projectType = projectType;
        this.bookingStatus = bookingStatus;
        this.paymentStatus = paymentStatus;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.studioId = studioId;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getClientId() {
        return clientId;
    }

    public void setClientId(UUID clientId) {
        this.clientId = clientId;
    }

    public UUID getAssignedProjectManagerId() {
        return assignedProjectManagerId;
    }

    public void setAssignedProjectManagerId(UUID assignedProjectManagerId) {
        this.assignedProjectManagerId = assignedProjectManagerId;
    }

    public String getProjectCode() {
        return projectCode;
    }

    public void setProjectCode(String projectCode) {
        this.projectCode = projectCode;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    public BookingStatus getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(BookingStatus bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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

    public UUID getStudioId() {
        return studioId;
    }

    public void setStudioId(UUID studioId) {
        this.studioId = studioId;
    }

    public String getProjectSubtype() {
        return projectSubtype;
    }

    public void setProjectSubtype(String projectSubtype) {
        this.projectSubtype = projectSubtype;
    }

    public String getProjectEvents() {
        return projectEvents;
    }

    public void setProjectEvents(String projectEvents) {
        this.projectEvents = projectEvents;
    }

    public BigDecimal getProjectBudget() {
        return projectBudget;
    }

    public void setProjectBudget(BigDecimal projectBudget) {
        this.projectBudget = projectBudget;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public String getShootLocation() {
        return shootLocation;
    }

    public void setShootLocation(String shootLocation) {
        this.shootLocation = shootLocation;
    }

    public String getGoogleMapsLink() {
        return googleMapsLink;
    }

    public void setGoogleMapsLink(String googleMapsLink) {
        this.googleMapsLink = googleMapsLink;
    }

    public LocalDate getShootDate() {
        return shootDate;
    }

    public void setShootDate(LocalDate shootDate) {
        this.shootDate = shootDate;
    }

    public LocalTime getShootStartTime() {
        return shootStartTime;
    }

    public void setShootStartTime(LocalTime shootStartTime) {
        this.shootStartTime = shootStartTime;
    }

    public LocalTime getShootEndTime() {
        return shootEndTime;
    }

    public void setShootEndTime(LocalTime shootEndTime) {
        this.shootEndTime = shootEndTime;
    }

    public ProjectPriority getPriority() {
        return priority;
    }

    public void setPriority(ProjectPriority priority) {
        this.priority = priority;
    }

    public String getLeadSource() {
        return leadSource;
    }

    public void setLeadSource(String leadSource) {
        this.leadSource = leadSource;
    }
}
