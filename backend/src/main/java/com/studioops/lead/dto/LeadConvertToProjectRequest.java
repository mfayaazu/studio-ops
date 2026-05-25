package com.studioops.lead.dto;

import com.studioops.project.BookingStatus;
import com.studioops.project.PaymentStatus;
import com.studioops.project.ProjectStatus;

public class LeadConvertToProjectRequest {

    private String projectCode;
    private String title;
    private String projectType;
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
    private ProjectStatus status;
    private String notes;

    public LeadConvertToProjectRequest() {
    }

    public LeadConvertToProjectRequest(String projectCode, String title, String projectType,
                                       BookingStatus bookingStatus, PaymentStatus paymentStatus,
                                       ProjectStatus status, String notes) {
        this.projectCode = projectCode;
        this.title = title;
        this.projectType = projectType;
        this.bookingStatus = bookingStatus;
        this.paymentStatus = paymentStatus;
        this.status = status;
        this.notes = notes;
    }

    // Getters and Setters

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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
