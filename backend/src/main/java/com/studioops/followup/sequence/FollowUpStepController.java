package com.studioops.followup.sequence;

import com.studioops.followup.sequence.dto.FollowUpStepCreateRequest;
import com.studioops.followup.sequence.dto.FollowUpStepResponse;
import com.studioops.followup.sequence.dto.FollowUpStepUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
public class FollowUpStepController {

    private final FollowUpStepService followUpStepService;

    public FollowUpStepController(FollowUpStepService followUpStepService) {
        this.followUpStepService = followUpStepService;
    }

    @PostMapping("/api/follow-up-steps")
    public ResponseEntity<FollowUpStepResponse> createStep(@Valid @RequestBody FollowUpStepCreateRequest request) {
        FollowUpStepResponse response = followUpStepService.createStep(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/api/follow-up-sequences/{sequenceId}/steps")
    public ResponseEntity<List<FollowUpStepResponse>> listStepsBySequence(@PathVariable("sequenceId") UUID sequenceId) {
        List<FollowUpStepResponse> responses = followUpStepService.listStepsBySequence(sequenceId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/api/follow-up-steps/{id}")
    public ResponseEntity<FollowUpStepResponse> getStepById(@PathVariable("id") UUID id) {
        FollowUpStepResponse response = followUpStepService.getStepById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/follow-up-steps/{id}")
    public ResponseEntity<FollowUpStepResponse> updateStep(
            @PathVariable("id") UUID id,
            @Valid @RequestBody FollowUpStepUpdateRequest request) {
        FollowUpStepResponse response = followUpStepService.updateStep(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/follow-up-steps/{id}")
    public ResponseEntity<Void> deleteStep(@PathVariable("id") UUID id) {
        followUpStepService.deleteStep(id);
        return ResponseEntity.noContent().build();
    }
}
