package com.studioops.project;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "project", uniqueConstraints = {
    @UniqueConstraint(name = "uq_project_studio_code", columnNames = {"studio_id", "project_code"})
})
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(name = "studio_id", nullable = false)
    private UUID studioId;

    @Column(name = "assigned_project_manager_id")
    private UUID assignedProjectManagerId;

    @Column(name = "project_code", nullable = false, length = 50)
    private String projectCode;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "project_type", nullable = false, length = 100)
    private String projectType;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false, length = 50)
    private BookingStatus bookingStatus = BookingStatus.INQUIRY;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 50)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ProjectStatus status = ProjectStatus.LEAD;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "project_subtype")
    private String projectSubtype;

    @Column(name = "project_events", length = 1000)
    private String projectEvents;

    @Column(name = "project_budget")
    private BigDecimal projectBudget;

    @Column(name = "amount_paid")
    private BigDecimal amountPaid;

    @Column(name = "shoot_location", length = 500)
    private String shootLocation;

    @Column(name = "google_maps_link", length = 1000)
    private String googleMapsLink;

    @Column(name = "shoot_date")
    private LocalDate shootDate;

    @Column(name = "shoot_start_time")
    private LocalTime shootStartTime;

    @Column(name = "shoot_end_time")
    private LocalTime shootEndTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 50)
    private ProjectPriority priority = ProjectPriority.MEDIUM;

    @Column(name = "lead_source")
    private String leadSource;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Project() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
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
