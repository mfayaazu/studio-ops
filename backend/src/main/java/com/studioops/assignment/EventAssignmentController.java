package com.studioops.assignment;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
public class EventAssignmentController {

    private final EventAssignmentService eventAssignmentService;

    public EventAssignmentController(EventAssignmentService eventAssignmentService) {
        this.eventAssignmentService = eventAssignmentService;
    }

    @PostMapping("/api/assignments")
    public ResponseEntity<EventAssignmentResponse> createAssignment(
            @Valid @RequestBody EventAssignmentCreateRequest request) {
        EventAssignmentResponse response = eventAssignmentService.createAssignment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/api/assignments")
    public ResponseEntity<List<EventAssignmentResponse>> listAssignments(
            @RequestParam(value = "eventId", required = false) UUID eventId,
            @RequestParam(value = "employeeId", required = false) UUID employeeId) {
        List<EventAssignmentResponse> responses = eventAssignmentService.listAssignments(eventId, employeeId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/api/assignments/{id}")
    public ResponseEntity<EventAssignmentResponse> getAssignmentById(@PathVariable("id") UUID id) {
        EventAssignmentResponse response = eventAssignmentService.getAssignmentById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/assignments/{id}")
    public ResponseEntity<EventAssignmentResponse> updateAssignment(
            @PathVariable("id") UUID id,
            @Valid @RequestBody EventAssignmentUpdateRequest request) {
        EventAssignmentResponse response = eventAssignmentService.updateAssignment(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/assignments/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable("id") UUID id) {
        eventAssignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
