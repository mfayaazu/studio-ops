package com.studioops.observability;

import com.studioops.observability.dto.EndpointMetricsResponse;
import com.studioops.observability.dto.PerformanceSummaryResponse;
import com.studioops.platformadmin.PlatformAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/platform-admin/performance")
public class PerformanceController {

    private final PerformanceService performanceService;
    private final PlatformAdminService platformAdminService;

    public PerformanceController(PerformanceService performanceService, PlatformAdminService platformAdminService) {
        this.performanceService = performanceService;
        this.platformAdminService = platformAdminService;
    }

    @GetMapping("/summary")
    public ResponseEntity<PerformanceSummaryResponse> getSummary() {
        platformAdminService.checkPlatformAdminAccess();
        return ResponseEntity.ok(performanceService.getPerformanceSummary());
    }

    @GetMapping("/top-endpoints")
    public ResponseEntity<Map<String, List<EndpointMetricsResponse>>> getTopEndpoints() {
        platformAdminService.checkPlatformAdminAccess();
        Map<String, List<EndpointMetricsResponse>> data = new HashMap<>();
        data.put("byVolume", performanceService.getTopEndpointsByVolume());
        data.put("slowest", performanceService.getTopSlowestEndpoints());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/recent-errors")
    public ResponseEntity<List<ApiRequestLog>> getRecentErrors() {
        platformAdminService.checkPlatformAdminAccess();
        return ResponseEntity.ok(performanceService.getRecentErrors());
    }

    @GetMapping("/slow-requests")
    public ResponseEntity<List<ApiRequestLog>> getRecentSlowRequests() {
        platformAdminService.checkPlatformAdminAccess();
        return ResponseEntity.ok(performanceService.getRecentSlowRequests());
    }
}
