package com.studioops.followup.log;

import com.studioops.followup.log.dto.CommunicationLogCreateRequest;
import com.studioops.followup.log.dto.CommunicationLogResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/communication-logs")
public class CommunicationLogController {

    private final CommunicationLogService communicationLogService;

    public CommunicationLogController(CommunicationLogService communicationLogService) {
        this.communicationLogService = communicationLogService;
    }

    @PostMapping
    public ResponseEntity<CommunicationLogResponse> createLog(@Valid @RequestBody CommunicationLogCreateRequest request) {
        CommunicationLogResponse response = communicationLogService.createLog(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CommunicationLogResponse>> listLogs(
            @RequestParam(value = "projectId", required = false) UUID projectId,
            @RequestParam(value = "clientId", required = false) UUID clientId,
            @RequestParam(value = "taskId", required = false) UUID taskId) {
        if (projectId != null) {
            return ResponseEntity.ok(communicationLogService.listLogsByProjectId(projectId));
        }
        if (clientId != null) {
            return ResponseEntity.ok(communicationLogService.listLogsByClientId(clientId));
        }
        if (taskId != null) {
            return ResponseEntity.ok(communicationLogService.listLogsByTaskId(taskId));
        }
        return ResponseEntity.ok(communicationLogService.listLogs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunicationLogResponse> getLogById(@PathVariable("id") UUID id) {
        CommunicationLogResponse response = communicationLogService.getLogById(id);
        return ResponseEntity.ok(response);
    }
}
