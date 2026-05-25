package com.studioops.postproduction.subtask;

import com.studioops.postproduction.subtask.dto.PostProductionSubtaskCreateRequest;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskMoveStatusRequest;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskResponse;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/post-production-subtasks")
public class PostProductionSubtaskController {

    private final PostProductionSubtaskService postProductionSubtaskService;

    public PostProductionSubtaskController(PostProductionSubtaskService postProductionSubtaskService) {
        this.postProductionSubtaskService = postProductionSubtaskService;
    }

    @PostMapping
    public ResponseEntity<PostProductionSubtaskResponse> createSubtask(
            @Valid @RequestBody PostProductionSubtaskCreateRequest request) {
        PostProductionSubtaskResponse response = postProductionSubtaskService.createSubtask(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PostProductionSubtaskResponse>> listSubtasks(
            @RequestParam(value = "taskId", required = false) UUID taskId,
            @RequestParam(value = "status", required = false) PostProductionSubtaskStatus status,
            @RequestParam(value = "assignedEmployeeId", required = false) UUID assignedEmployeeId) {
        List<PostProductionSubtaskResponse> responses = postProductionSubtaskService.listSubtasks(
                taskId, status, assignedEmployeeId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostProductionSubtaskResponse> getSubtaskById(@PathVariable("id") UUID id) {
        PostProductionSubtaskResponse response = postProductionSubtaskService.getSubtaskById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostProductionSubtaskResponse> updateSubtask(
            @PathVariable("id") UUID id,
            @Valid @RequestBody PostProductionSubtaskUpdateRequest request) {
        PostProductionSubtaskResponse response = postProductionSubtaskService.updateSubtask(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/move-status")
    public ResponseEntity<PostProductionSubtaskResponse> moveStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody PostProductionSubtaskMoveStatusRequest request) {
        PostProductionSubtaskResponse response = postProductionSubtaskService.moveStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubtask(@PathVariable("id") UUID id) {
        postProductionSubtaskService.deleteSubtask(id);
        return ResponseEntity.noContent().build();
    }
}
