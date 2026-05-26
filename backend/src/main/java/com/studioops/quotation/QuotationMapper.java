package com.studioops.quotation;

import com.studioops.quotation.dto.QuotationResponse;

public class QuotationMapper {

    public static QuotationResponse toResponse(Quotation quotation) {
        if (quotation == null) {
            return null;
        }
        QuotationResponse response = new QuotationResponse();
        response.setId(quotation.getId());
        response.setStudioId(quotation.getStudioId());
        response.setLeadId(quotation.getLeadId());
        response.setProjectId(quotation.getProjectId());
        response.setClientId(quotation.getClientId());
        response.setQuotationNumber(quotation.getQuotationNumber());
        response.setTitle(quotation.getTitle());
        response.setDescription(quotation.getDescription());
        response.setStatus(quotation.getStatus());
        response.setSubtotal(quotation.getSubtotal());
        response.setDiscountAmount(quotation.getDiscountAmount());
        response.setTaxAmount(quotation.getTaxAmount());
        response.setTotalAmount(quotation.getTotalAmount());
        response.setCurrency(quotation.getCurrency());
        response.setValidUntil(quotation.getValidUntil());
        response.setSentAt(quotation.getSentAt());
        response.setAcceptedAt(quotation.getAcceptedAt());
        response.setRejectedAt(quotation.getRejectedAt());
        response.setNotes(quotation.getNotes());
        response.setCreatedAt(quotation.getCreatedAt());
        response.setUpdatedAt(quotation.getUpdatedAt());
        return response;
    }
}
