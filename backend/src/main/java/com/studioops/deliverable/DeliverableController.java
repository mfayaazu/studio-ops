package com.studioops.deliverable;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/deliverables")
public class DeliverableController {

    private final DeliverableService deliverableService;

    public DeliverableController(DeliverableService deliverableService) {
        this.deliverableService = deliverableService;
    }

    @PostMapping
    public ResponseEntity<DeliverableResponse> createDeliverable(@Valid @RequestBody DeliverableCreateRequest request) {
        DeliverableResponse response = deliverableService.createDeliverable(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DeliverableResponse>> listDeliverables(
            @RequestParam(value = "projectId", required = false) UUID projectId) {
        List<DeliverableResponse> responses = deliverableService.listDeliverables(projectId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliverableResponse> getDeliverableById(@PathVariable("id") UUID id) {
        DeliverableResponse response = deliverableService.getDeliverableById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeliverableResponse> updateDeliverable(
            @PathVariable("id") UUID id,
            @Valid @RequestBody DeliverableUpdateRequest request) {
        DeliverableResponse response = deliverableService.updateDeliverable(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeliverable(@PathVariable("id") UUID id) {
        deliverableService.deleteDeliverable(id);
        return ResponseEntity.noContent().build();
    }
}
