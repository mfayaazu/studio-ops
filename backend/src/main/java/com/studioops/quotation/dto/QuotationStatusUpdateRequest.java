package com.studioops.quotation.dto;

import com.studioops.quotation.QuotationStatus;
import jakarta.validation.constraints.NotNull;

public class QuotationStatusUpdateRequest {

    @NotNull(message = "status is required")
    private QuotationStatus status;

    public QuotationStatusUpdateRequest() {
    }

    public QuotationStatusUpdateRequest(QuotationStatus status) {
        this.status = status;
    }

    public QuotationStatus getStatus() {
        return status;
    }

    public void setStatus(QuotationStatus status) {
        this.status = status;
    }
}
