package com.studioops.quotation;

import com.studioops.quotation.dto.QuotationCreateRequest;
import com.studioops.quotation.dto.QuotationResponse;
import com.studioops.quotation.dto.QuotationUpdateRequest;
import com.studioops.quotation.dto.QuotationStatusUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quotations")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(QuotationService quotationService) {
        this.quotationService = quotationService;
    }

    @PostMapping
    public ResponseEntity<QuotationResponse> createQuotation(@Valid @RequestBody QuotationCreateRequest request) {
        QuotationResponse response = quotationService.createQuotation(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<QuotationResponse>> listQuotations(
            @RequestParam(value = "status", required = false) QuotationStatus status) {
        List<QuotationResponse> responses = quotationService.listQuotations(status);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuotationResponse> getQuotationById(@PathVariable("id") UUID id) {
        QuotationResponse response = quotationService.getQuotationById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuotationResponse> updateQuotation(
            @PathVariable("id") UUID id,
            @Valid @RequestBody QuotationUpdateRequest request) {
        QuotationResponse response = quotationService.updateQuotation(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<QuotationResponse> updateStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody QuotationStatusUpdateRequest request) {
        QuotationResponse response = quotationService.updateStatus(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuotation(@PathVariable("id") UUID id) {
        quotationService.deleteQuotation(id);
        return ResponseEntity.noContent().build();
    }
}
