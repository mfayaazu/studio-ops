package com.studioops.employee.dto;

import com.studioops.employee.EmployeeStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class EmployeeCreateRequest {

    private UUID userId;

    @NotBlank(message = "fullName is required")
    @Size(max = 200, message = "fullName must not exceed 200 characters")
    private String fullName;

    @NotBlank(message = "email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "email must not exceed 255 characters")
    private String email;

    @Size(max = 50, message = "phone must not exceed 50 characters")
    private String phone;

    @NotBlank(message = "primaryRole is required")
    @Size(max = 100, message = "primaryRole must not exceed 100 characters")
    private String primaryRole;

    private String skills;

    private EmployeeStatus status;

    private UUID studioId;

    private Boolean createLogin;
    private String loginEmail;
    private String userRole;
    private String temporaryPassword;

    public EmployeeCreateRequest() {
    }

    public EmployeeCreateRequest(UUID userId, String fullName, String email, String phone, String primaryRole, String skills, EmployeeStatus status) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.primaryRole = primaryRole;
        this.skills = skills;
        this.status = status;
    }

    public EmployeeCreateRequest(UUID userId, String fullName, String email, String phone, String primaryRole, String skills, EmployeeStatus status, UUID studioId) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.primaryRole = primaryRole;
        this.skills = skills;
        this.status = status;
        this.studioId = studioId;
    }

    public UUID getStudioId() {
        return studioId;
    }

    public void setStudioId(UUID studioId) {
        this.studioId = studioId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPrimaryRole() {
        return primaryRole;
    }

    public void setPrimaryRole(String primaryRole) {
        this.primaryRole = primaryRole;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public EmployeeStatus getStatus() {
        return status;
    }

    public void setStatus(EmployeeStatus status) {
        this.status = status;
    }

    public Boolean getCreateLogin() {
        return createLogin;
    }

    public void setCreateLogin(Boolean createLogin) {
        this.createLogin = createLogin;
    }

    public String getLoginEmail() {
        return loginEmail;
    }

    public void setLoginEmail(String loginEmail) {
        this.loginEmail = loginEmail;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }

    public void setTemporaryPassword(String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }
}
