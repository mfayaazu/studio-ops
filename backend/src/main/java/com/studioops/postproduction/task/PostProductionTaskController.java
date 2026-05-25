package com.studioops.postproduction.task;

import com.studioops.postproduction.task.dto.PostProductionTaskCreateRequest;
import com.studioops.postproduction.task.dto.PostProductionTaskMoveStatusRequest;
import com.studioops.postproduction.task.dto.PostProductionTaskResponse;
import com.studioops.postproduction.task.dto.PostProductionTaskUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/post-production-tasks")
public class PostProductionTaskController {

    private final PostProductionTaskService postProductionTaskService;

    public PostProductionTaskController(PostProductionTaskService postProductionTaskService) {
        this.postProductionTaskService = postProductionTaskService;
    }

    @PostMapping
    public ResponseEntity<PostProductionTaskResponse> createTask(
            @Valid @RequestBody PostProductionTaskCreateRequest request) {
        PostProductionTaskResponse response = postProductionTaskService.createTask(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PostProductionTaskResponse>> listTasks(
            @RequestParam(value = "projectId", required = false) UUID projectId,
            @RequestParam(value = "deliverableId", required = false) UUID deliverableId,
            @RequestParam(value = "status", required = false) PostProductionTaskStatus status,
            @RequestParam(value = "assignedEmployeeId", required = false) UUID assignedEmployeeId,
            @RequestParam(value = "dueBefore", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueBefore,
            @RequestParam(value = "search", required = false) String search) {
        List<PostProductionTaskResponse> responses = postProductionTaskService.listTasks(
                projectId, deliverableId, status, assignedEmployeeId, dueBefore, search);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostProductionTaskResponse> getTaskById(@PathVariable("id") UUID id) {
        PostProductionTaskResponse response = postProductionTaskService.getTaskById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostProductionTaskResponse> updateTask(
            @PathVariable("id") UUID id,
            @Valid @RequestBody PostProductionTaskUpdateRequest request) {
        PostProductionTaskResponse response = postProductionTaskService.updateTask(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/move-status")
    public ResponseEntity<PostProductionTaskResponse> moveStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody PostProductionTaskMoveStatusRequest request) {
        PostProductionTaskResponse response = postProductionTaskService.moveStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable("id") UUID id) {
        postProductionTaskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
