package com.studioops.event;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/api/events")
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventCreateRequest request) {
        EventResponse response = eventService.createEvent(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/api/events")
    public ResponseEntity<List<EventResponse>> listEvents(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<EventResponse> responses = eventService.listEvents(search, fromDate, toDate);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/api/events/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable("id") UUID id) {
        EventResponse response = eventService.getEventById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/projects/{projectId}/events")
    public ResponseEntity<List<EventResponse>> getEventsByProjectId(@PathVariable("projectId") UUID projectId) {
        List<EventResponse> responses = eventService.getEventsByProjectId(projectId);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/api/events/{id}")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable("id") UUID id,
            @Valid @RequestBody EventUpdateRequest request) {
        EventResponse response = eventService.updateEvent(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable("id") UUID id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
