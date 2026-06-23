package com.studioops.client.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ClientUpdateRequest {

    @NotBlank(message = "fullName is required")
    @Size(max = 200, message = "fullName must not exceed 200 characters")
    private String fullName;

    @NotBlank(message = "phone is required")
    @Size(max = 50, message = "phone must not exceed 50 characters")
    private String phone;

    @Pattern(regexp = "^$|^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Please enter a valid email address.")
    @Size(max = 255, message = "email must not exceed 255 characters")
    private String email;

    private String notes;

    public ClientUpdateRequest() {
    }

    public ClientUpdateRequest(String fullName, String phone, String email, String notes) {
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.notes = notes;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
