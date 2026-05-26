package com.studioops.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SignupRequest {

    @NotBlank(message = "Studio name is required")
    @Size(max = 200, message = "Studio name cannot exceed 200 characters")
    private String studioName;

    @NotBlank(message = "Owner name is required")
    @Size(max = 255, message = "Owner name cannot exceed 255 characters")
    private String ownerName;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 255, message = "Email cannot exceed 255 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    @Size(max = 50, message = "Phone cannot exceed 50 characters")
    private String phone;

    @Size(max = 100, message = "Country cannot exceed 100 characters")
    private String country;

    public SignupRequest() {
    }

    public SignupRequest(String studioName, String ownerName, String email, String password, String phone, String country) {
        this.studioName = studioName;
        this.ownerName = ownerName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.country = country;
    }

    public String getStudioName() {
        return studioName;
    }

    public void setStudioName(String studioName) {
        this.studioName = studioName;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }
}
