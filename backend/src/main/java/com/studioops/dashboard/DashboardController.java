package com.studioops.dashboard;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.studioops.common.tenant.TenantContext;
import com.studioops.dashboard.dto.DashboardSummaryResponse;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final TenantContext tenantContext;

    public DashboardController(DashboardService dashboardService, TenantContext tenantContext) {
        this.dashboardService = dashboardService;
        this.tenantContext = tenantContext;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse getSummary() {
        return dashboardService.getSummary(tenantContext.getCurrentStudioId());
    }
}
