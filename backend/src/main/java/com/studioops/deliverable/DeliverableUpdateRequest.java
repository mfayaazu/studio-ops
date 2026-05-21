package com.studioops.deliverable;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class DeliverableUpdateRequest {

    @NotBlank(message = "name is required")
    @Size(max = 255, message = "name must not exceed 255 characters")
    private String name;

    @NotNull(message = "deliverableType is required")
    private DeliverableType deliverableType;

    @NotNull(message = "status is required")
    private DeliverableStatus status;

    @Size(max = 1000, message = "referenceUrl must not exceed 1000 characters")
    private String referenceUrl;

    private LocalDate dueDate;

    public DeliverableUpdateRequest() {
    }

    public DeliverableUpdateRequest(String name, DeliverableType deliverableType, DeliverableStatus status, String referenceUrl, LocalDate dueDate) {
        this.name = name;
        this.deliverableType = deliverableType;
        this.status = status;
        this.referenceUrl = referenceUrl;
        this.dueDate = dueDate;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DeliverableType getDeliverableType() {
        return deliverableType;
    }

    public void setDeliverableType(DeliverableType deliverableType) {
        this.deliverableType = deliverableType;
    }

    public DeliverableStatus getStatus() {
        return status;
    }

    public void setStatus(DeliverableStatus status) {
        this.status = status;
    }

    public String getReferenceUrl() {
        return referenceUrl;
    }

    public void setReferenceUrl(String referenceUrl) {
        this.referenceUrl = referenceUrl;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}
