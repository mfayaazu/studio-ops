package com.studioops.lead;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "\"lead\"")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "studio_id", nullable = false)
    private UUID studioId;

    @Column(name = "client_id")
    private UUID clientId;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "client_name", nullable = false, length = 200)
    private String clientName;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_channel", nullable = false, length = 50)
    private LeadPreferredChannel preferredChannel;

    @Column(name = "event_type", length = 100)
    private String eventType;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "estimated_value", precision = 12, scale = 2)
    private BigDecimal estimatedValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 50)
    private LeadPriority priority = LeadPriority.NORMAL;

    @Column(name = "quotation_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal quotationTotal = BigDecimal.ZERO;

    @Column(name = "amount_paid", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "amount_remaining", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountRemaining = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 50)
    private LeadPaymentStatus paymentStatus = LeadPaymentStatus.UNPAID;

    @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LeadEventSegment> eventSegments = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "lead_source", nullable = false, length = 50)
    private LeadSource leadSource;

    @Enumerated(EnumType.STRING)
    @Column(name = "pipeline_stage", nullable = false, length = 50)
    private LeadPipelineStage pipelineStage;

    @Column(name = "assigned_user_id")
    private UUID assignedUserId;

    @Column(name = "last_contacted_at")
    private Instant lastContactedAt;

    @Column(name = "next_follow_up_at")
    private Instant nextFollowUpAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "lost_reason", length = 100)
    private LeadLostReason lostReason;

    @Column(name = "converted_at")
    private Instant convertedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Lead() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        syncCompatibilityFields();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
        syncCompatibilityFields();
    }

    private void syncCompatibilityFields() {
        if (eventSegments != null && !eventSegments.isEmpty()) {
            LeadEventSegment first = eventSegments.get(0);
            this.eventType = first.getEventType();
            this.eventDate = first.getEventDate();
            this.city = first.getCity();
        }
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getStudioId() {
        return studioId;
    }

    public void setStudioId(UUID studioId) {
        this.studioId = studioId;
    }

    public UUID getClientId() {
        return clientId;
    }

    public void setClientId(UUID clientId) {
        this.clientId = clientId;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LeadPreferredChannel getPreferredChannel() {
        return preferredChannel;
    }

    public void setPreferredChannel(LeadPreferredChannel preferredChannel) {
        this.preferredChannel = preferredChannel;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public BigDecimal getEstimatedValue() {
        return estimatedValue;
    }

    public void setEstimatedValue(BigDecimal estimatedValue) {
        this.estimatedValue = estimatedValue;
    }

    public LeadSource getLeadSource() {
        return leadSource;
    }

    public void setLeadSource(LeadSource leadSource) {
        this.leadSource = leadSource;
    }

    public LeadPipelineStage getPipelineStage() {
        return pipelineStage;
    }

    public void setPipelineStage(LeadPipelineStage pipelineStage) {
        this.pipelineStage = pipelineStage;
    }

    public UUID getAssignedUserId() {
        return assignedUserId;
    }

    public void setAssignedUserId(UUID assignedUserId) {
        this.assignedUserId = assignedUserId;
    }

    public Instant getLastContactedAt() {
        return lastContactedAt;
    }

    public void setLastContactedAt(Instant lastContactedAt) {
        this.lastContactedAt = lastContactedAt;
    }

    public Instant getNextFollowUpAt() {
        return nextFollowUpAt;
    }

    public void setNextFollowUpAt(Instant nextFollowUpAt) {
        this.nextFollowUpAt = nextFollowUpAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LeadLostReason getLostReason() {
        return lostReason;
    }

    public void setLostReason(LeadLostReason lostReason) {
        this.lostReason = lostReason;
    }

    public Instant getConvertedAt() {
        return convertedAt;
    }

    public void setConvertedAt(Instant convertedAt) {
        this.convertedAt = convertedAt;
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

    public LeadPriority getPriority() {
        return priority;
    }

    public void setPriority(LeadPriority priority) {
        this.priority = priority;
    }

    public BigDecimal getQuotationTotal() {
        return quotationTotal;
    }

    public void setQuotationTotal(BigDecimal quotationTotal) {
        this.quotationTotal = quotationTotal;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public BigDecimal getAmountRemaining() {
        return amountRemaining;
    }

    public void setAmountRemaining(BigDecimal amountRemaining) {
        this.amountRemaining = amountRemaining;
    }

    public LeadPaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(LeadPaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public List<LeadEventSegment> getEventSegments() {
        return eventSegments;
    }

    public void setEventSegments(List<LeadEventSegment> eventSegments) {
        this.eventSegments = eventSegments;
        if (eventSegments != null) {
            for (LeadEventSegment s : eventSegments) {
                s.setLead(this);
            }
        }
    }
}
