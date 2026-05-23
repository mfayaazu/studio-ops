package com.studioops.followup.sequence;

import com.studioops.followup.sequence.dto.FollowUpSequenceCreateRequest;
import com.studioops.followup.sequence.dto.FollowUpSequenceResponse;
import com.studioops.followup.sequence.dto.FollowUpSequenceUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/follow-up-sequences")
public class FollowUpSequenceController {

    private final FollowUpSequenceService followUpSequenceService;

    public FollowUpSequenceController(FollowUpSequenceService followUpSequenceService) {
        this.followUpSequenceService = followUpSequenceService;
    }

    @PostMapping
    public ResponseEntity<FollowUpSequenceResponse> createSequence(@Valid @RequestBody FollowUpSequenceCreateRequest request) {
        FollowUpSequenceResponse response = followUpSequenceService.createSequence(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<FollowUpSequenceResponse>> listSequences(
            @RequestParam(value = "search", required = false) String search) {
        List<FollowUpSequenceResponse> responses = followUpSequenceService.listSequences(search);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FollowUpSequenceResponse> getSequenceById(@PathVariable("id") UUID id) {
        FollowUpSequenceResponse response = followUpSequenceService.getSequenceById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FollowUpSequenceResponse> updateSequence(
            @PathVariable("id") UUID id,
            @Valid @RequestBody FollowUpSequenceUpdateRequest request) {
        FollowUpSequenceResponse response = followUpSequenceService.updateSequence(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSequence(@PathVariable("id") UUID id) {
        followUpSequenceService.deleteSequence(id);
        return ResponseEntity.noContent().build();
    }
}
