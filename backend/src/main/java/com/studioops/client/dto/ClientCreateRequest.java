package com.studioops.client.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class ClientCreateRequest {

    @NotBlank(message = "fullName is required")
    @Size(max = 200, message = "fullName must not exceed 200 characters")
    private String fullName;

    @NotBlank(message = "phone is required")
    @Size(max = 50, message = "phone must not exceed 50 characters")
    private String phone;

    @Email(message = "Invalid email format")
    @Size(max = 255, message = "email must not exceed 255 characters")
    private String email;

    private String notes;

    private UUID studioId;

    public ClientCreateRequest() {
    }

    public ClientCreateRequest(String fullName, String phone, String email, String notes) {
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.notes = notes;
    }

    public ClientCreateRequest(String fullName, String phone, String email, String notes, UUID studioId) {
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.notes = notes;
        this.studioId = studioId;
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

    public UUID getStudioId() {
        return studioId;
    }

    public void setStudioId(UUID studioId) {
        this.studioId = studioId;
    }
}
