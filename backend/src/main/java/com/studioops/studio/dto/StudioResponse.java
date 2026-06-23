package com.studioops.studio.dto;

import com.studioops.studio.StudioStatus;
import com.studioops.studio.SubscriptionPlan;
import com.studioops.studio.SubscriptionStatus;
import java.time.Instant;
import java.util.UUID;

public class StudioResponse {

    private UUID id;
    private String name;
    private String slug;
    private String businessEmail;
    private String phone;
    private String shortCode;
    private String country;
    private String timezone;
    private StudioStatus status;
    private SubscriptionPlan subscriptionPlan;
    private SubscriptionStatus subscriptionStatus;
    private Instant createdAt;
    private Instant updatedAt;

    public StudioResponse() {
    }

    public StudioResponse(UUID id, String name, String slug, String businessEmail, String phone, String country, String timezone, StudioStatus status, SubscriptionPlan subscriptionPlan, SubscriptionStatus subscriptionStatus, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.businessEmail = businessEmail;
        this.phone = phone;
        this.country = country;
        this.timezone = timezone;
        this.status = status;
        this.subscriptionPlan = subscriptionPlan;
        this.subscriptionStatus = subscriptionStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public String getShortCode() {
        return shortCode;
    }

    public void setShortCode(String shortCode) {
        this.shortCode = shortCode;
    }
}
