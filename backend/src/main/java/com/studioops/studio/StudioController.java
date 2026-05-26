package com.studioops.studio;

import com.studioops.studio.dto.StudioCreateRequest;
import com.studioops.studio.dto.StudioResponse;
import com.studioops.studio.dto.StudioUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/studios")
public class StudioController {

    private final StudioService studioService;

    public StudioController(StudioService studioService) {
        this.studioService = studioService;
    }

    @PostMapping
    public ResponseEntity<StudioResponse> createStudio(@Valid @RequestBody StudioCreateRequest request) {
        StudioResponse response = studioService.createStudio(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<StudioResponse>> listStudios(
            @RequestParam(value = "search", required = false) String search) {
        List<StudioResponse> responses = studioService.listStudios(search);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudioResponse> getStudioById(@PathVariable("id") UUID id) {
        StudioResponse response = studioService.getStudioById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudioResponse> updateStudio(
            @PathVariable("id") UUID id,
            @Valid @RequestBody StudioUpdateRequest request) {
        StudioResponse response = studioService.updateStudio(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<StudioResponse> approveStudio(@PathVariable("id") UUID id) {
        StudioResponse response = studioService.approveStudio(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudio(@PathVariable("id") UUID id) {
        studioService.deleteStudio(id);
        return ResponseEntity.noContent().build();
    }
}
