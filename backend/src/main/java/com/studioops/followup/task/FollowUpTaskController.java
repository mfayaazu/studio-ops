package com.studioops.followup.task;

import com.studioops.followup.task.dto.FollowUpTaskCreateRequest;
import com.studioops.followup.task.dto.FollowUpTaskResponse;
import com.studioops.followup.task.dto.FollowUpTaskUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/follow-up-tasks")
public class FollowUpTaskController {

    private final FollowUpTaskService followUpTaskService;

    public FollowUpTaskController(FollowUpTaskService followUpTaskService) {
        this.followUpTaskService = followUpTaskService;
    }

    @PostMapping
    public ResponseEntity<FollowUpTaskResponse> createTask(@Valid @RequestBody FollowUpTaskCreateRequest request) {
        FollowUpTaskResponse response = followUpTaskService.createTask(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<FollowUpTaskResponse>> listTasks(
            @RequestParam(value = "status", required = false) FollowUpTaskStatus status,
            @RequestParam(value = "projectId", required = false) UUID projectId,
            @RequestParam(value = "clientId", required = false) UUID clientId) {
        List<FollowUpTaskResponse> responses = followUpTaskService.listTasks(status, projectId, clientId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/due")
    public ResponseEntity<List<FollowUpTaskResponse>> getDueTasks() {
        List<FollowUpTaskResponse> responses = followUpTaskService.getDueTasks();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FollowUpTaskResponse> getTaskById(@PathVariable("id") UUID id) {
        FollowUpTaskResponse response = followUpTaskService.getTaskById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FollowUpTaskResponse> updateTask(
            @PathVariable("id") UUID id,
            @Valid @RequestBody FollowUpTaskUpdateRequest request) {
        FollowUpTaskResponse response = followUpTaskService.updateTask(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable("id") UUID id) {
        followUpTaskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<FollowUpTaskResponse> approveTask(@PathVariable("id") UUID id) {
        FollowUpTaskResponse response = followUpTaskService.approveTask(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/skip")
    public ResponseEntity<FollowUpTaskResponse> skipTask(@PathVariable("id") UUID id) {
        FollowUpTaskResponse response = followUpTaskService.skipTask(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<FollowUpTaskResponse> cancelTask(@PathVariable("id") UUID id) {
        FollowUpTaskResponse response = followUpTaskService.cancelTask(id);
        return ResponseEntity.ok(response);
    }
}
