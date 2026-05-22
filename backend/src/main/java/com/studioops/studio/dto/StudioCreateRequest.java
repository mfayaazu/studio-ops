package com.studioops.studio.dto;

import com.studioops.studio.StudioStatus;
import com.studioops.studio.SubscriptionPlan;
import com.studioops.studio.SubscriptionStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class StudioCreateRequest {

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

    @Size(max = 100, message = "timezone must not exceed 100 characters")
    private String timezone;

    private StudioStatus status;

    private SubscriptionPlan subscriptionPlan;

    private SubscriptionStatus subscriptionStatus;

    public StudioCreateRequest() {
    }

    public StudioCreateRequest(String name, String slug, String businessEmail, String phone, String country, String timezone) {
        this.name = name;
        this.slug = slug;
        this.businessEmail = businessEmail;
        this.phone = phone;
        this.country = country;
        this.timezone = timezone;
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
