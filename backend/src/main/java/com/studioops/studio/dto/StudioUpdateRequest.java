package com.studioops.studio.dto;

import com.studioops.studio.StudioStatus;
import com.studioops.studio.SubscriptionPlan;
import com.studioops.studio.SubscriptionStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class StudioUpdateRequest {

    @NotBlank(message = "name is required")
    @Size(max = 200, message = "name must not exceed 200 characters")
    private String name;

    @NotBlank(message = "slug is required")
    @Size(max = 100, message = "slug must not exceed 100 characters")
    private String slug;

    @Email(message = "Invalid businessEmail format")
    @Size(max = 255, message = "businessEmail must not exceed 255 characters")
    private String businessEmail;

    @Size(max = 50, message = "phone must not exceed 50 characters")
    private String phone;

    @Size(max = 100, message = "country must not exceed 100 characters")
    private String country;

    @NotBlank(message = "timezone is required")
    @Size(max = 100, message = "timezone must not exceed 100 characters")
    private String timezone;

    @NotNull(message = "status is required")
    private StudioStatus status;

    @NotNull(message = "subscriptionPlan is required")
    private SubscriptionPlan subscriptionPlan;

    @NotNull(message = "subscriptionStatus is required")
    private SubscriptionStatus subscriptionStatus;

    public StudioUpdateRequest() {
    }

    public StudioUpdateRequest(String name, String slug, String businessEmail, String phone, String country, String timezone, StudioStatus status, SubscriptionPlan subscriptionPlan, SubscriptionStatus subscriptionStatus) {
        this.name = name;
        this.slug = slug;
        this.businessEmail = businessEmail;
        this.phone = phone;
        this.country = country;
        this.timezone = timezone;
        this.status = status;
        this.subscriptionPlan = subscriptionPlan;
        this.subscriptionStatus = subscriptionStatus;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getBusinessEmail() {
        return businessEmail;
    }

    public void setBusinessEmail(String businessEmail) {
        this.businessEmail = businessEmail;
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

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public StudioStatus getStatus() {
        return status;
    }

    public void setStatus(StudioStatus status) {
        this.status = status;
    }

    public SubscriptionPlan getSubscriptionPlan() {
        return subscriptionPlan;
    }

    public void setSubscriptionPlan(SubscriptionPlan subscriptionPlan) {
        this.subscriptionPlan = subscriptionPlan;
    }

    public SubscriptionStatus getSubscriptionStatus() {
        return subscriptionStatus;
    }

    public void setSubscriptionStatus(SubscriptionStatus subscriptionStatus) {
        this.subscriptionStatus = subscriptionStatus;
    }
}
