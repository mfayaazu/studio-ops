package com.studioops.project.dto;

import com.studioops.project.BookingStatus;
import com.studioops.project.PaymentStatus;
import com.studioops.project.ProjectStatus;
import com.studioops.project.ProjectPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class ProjectUpdateRequest {

    @NotNull(message = "clientId is required")
    private UUID clientId;

    private UUID assignedProjectManagerId;

    @NotBlank(message = "projectCode is required")
    @Size(max = 50, message = "projectCode must not exceed 50 characters")
    private String projectCode;

    @NotBlank(message = "title is required")
    @Size(max = 255, message = "title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "projectType is required")
    @Size(max = 100, message = "projectType must not exceed 100 characters")
    private String projectType;

    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;

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

    public ProjectUpdateRequest() {
    }

    public ProjectUpdateRequest(UUID clientId, UUID assignedProjectManagerId, String projectCode, String title,
                                String projectType, BookingStatus bookingStatus, PaymentStatus paymentStatus,
                                ProjectStatus status, LocalDate startDate, LocalDate endDate, String notes) {
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
