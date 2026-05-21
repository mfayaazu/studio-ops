package com.studioops.backup;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/backups")
public class BackupRecordController {

    private final BackupRecordService backupRecordService;

    public BackupRecordController(BackupRecordService backupRecordService) {
        this.backupRecordService = backupRecordService;
    }

    @PostMapping
    public ResponseEntity<BackupRecordResponse> createBackup(@Valid @RequestBody BackupRecordCreateRequest request) {
        BackupRecordResponse response = backupRecordService.createBackup(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BackupRecordResponse>> listBackups(
            @RequestParam(value = "projectId", required = false) UUID projectId,
            @RequestParam(value = "deliverableId", required = false) UUID deliverableId) {
        List<BackupRecordResponse> responses = backupRecordService.listBackups(projectId, deliverableId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BackupRecordResponse> getBackupById(@PathVariable("id") UUID id) {
        BackupRecordResponse response = backupRecordService.getBackupById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BackupRecordResponse> updateBackup(
            @PathVariable("id") UUID id,
            @Valid @RequestBody BackupRecordUpdateRequest request) {
        BackupRecordResponse response = backupRecordService.updateBackup(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBackup(@PathVariable("id") UUID id) {
        backupRecordService.deleteBackup(id);
        return ResponseEntity.noContent().build();
    }
}
