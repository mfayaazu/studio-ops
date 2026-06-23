package com.studioops.lead.dto;

import com.studioops.lead.LeadPreferredChannel;
import com.studioops.lead.LeadSource;
import com.studioops.lead.LeadPriority;
import com.studioops.lead.LeadPaymentStatus;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class LeadUpdateRequest {

    @NotBlank(message = "clientName is required")
    @Size(max = 200, message = "clientName must be less than 200 characters")
    private String clientName;

    @Size(max = 50, message = "phone must be less than 50 characters")
    private String phone;

    @Pattern(regexp = "^$|^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Please enter a valid email address.")
    @Size(max = 255, message = "email must be less than 255 characters")
    private String email;

    @NotNull(message = "preferredChannel is required")
    private LeadPreferredChannel preferredChannel;

    @Size(max = 100, message = "eventType must be less than 100 characters")
    private String eventType;

    private LocalDate eventDate;

    @Size(max = 100, message = "city must be less than 100 characters")
    private String city;

    private BigDecimal estimatedValue;

    @NotNull(message = "leadSource is required")
    private LeadSource leadSource;

    private UUID assignedUserId;
    private Instant lastContactedAt;
    private Instant nextFollowUpAt;
    private String notes;

    private LeadPriority priority;
    private BigDecimal quotationTotal;
    private BigDecimal amountPaid;
    private BigDecimal amountRemaining;
    private LeadPaymentStatus paymentStatus;
    private java.util.List<LeadEventSegmentRequest> eventSegments;

    public LeadUpdateRequest() {
    }

    public LeadUpdateRequest(String clientName, String phone, String email, LeadPreferredChannel preferredChannel, String eventType, LocalDate eventDate, String city, BigDecimal estimatedValue, LeadSource leadSource, UUID assignedUserId, Instant lastContactedAt, Instant nextFollowUpAt, String notes) {
        this.clientName = clientName;
        this.phone = phone;
        this.email = email;
        this.preferredChannel = preferredChannel;
        this.eventType = eventType;
        this.eventDate = eventDate;
        this.city = city;
        this.estimatedValue = estimatedValue;
        this.leadSource = leadSource;
        this.assignedUserId = assignedUserId;
        this.lastContactedAt = lastContactedAt;
        this.nextFollowUpAt = nextFollowUpAt;
        this.notes = notes;
    }

    // Getters and Setters

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

    public java.util.List<LeadEventSegmentRequest> getEventSegments() {
        return eventSegments;
    }

    public void setEventSegments(java.util.List<LeadEventSegmentRequest> eventSegments) {
        this.eventSegments = eventSegments;
    }
}
