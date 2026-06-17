package com.studioops.platformadmin;

import com.studioops.platformadmin.dto.PlatformStudioResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/platform-admin")
public class PlatformAdminController {

    private final PlatformAdminService platformAdminService;

    public PlatformAdminController(PlatformAdminService platformAdminService) {
        this.platformAdminService = platformAdminService;
    }

    @GetMapping("/studios")
    public ResponseEntity<List<PlatformStudioResponse>> listStudios() {
        return ResponseEntity.ok(platformAdminService.listStudios());
    }

    @GetMapping("/studios/pending")
    public ResponseEntity<List<PlatformStudioResponse>> listPendingStudios() {
        return ResponseEntity.ok(platformAdminService.listPendingStudios());
    }

    @PostMapping("/studios/{id}/approve")
    public ResponseEntity<PlatformStudioResponse> approveStudio(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(platformAdminService.approveStudio(id));
    }

    @PostMapping("/studios/{id}/reject")
    public ResponseEntity<PlatformStudioResponse> rejectStudio(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(platformAdminService.rejectStudio(id));
    }

    @PostMapping("/studios/{id}/suspend")
    public ResponseEntity<PlatformStudioResponse> suspendStudio(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(platformAdminService.suspendStudio(id));
    }

    @PostMapping("/studios/{id}/resend-ses-verification")
    public ResponseEntity<Void> resendSesVerification(@PathVariable("id") UUID id) {
        platformAdminService.resendSesVerification(id);
        return ResponseEntity.ok().build();
    }
}
