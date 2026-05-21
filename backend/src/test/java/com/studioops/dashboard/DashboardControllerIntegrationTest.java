package com.studioops.dashboard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.studioops.dashboard.dto.DashboardBackupChecklist;
import com.studioops.dashboard.dto.DashboardStats;
import com.studioops.dashboard.dto.DashboardSummaryResponse;
import com.studioops.dashboard.dto.DashboardWarning;

@WebMvcTest(DashboardController.class)
@Import(SecurityConfig.class)
class DashboardControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @Test
    void getSummary_Success() throws Exception {
        DashboardStats stats = new DashboardStats(24L, 8L, 3L, 12L);
        
        DashboardWarning warning = new DashboardWarning(
                "DOUBLE_BOOKING",
                UUID.randomUUID(),
                "John Doe",
                UUID.randomUUID(),
                "Studio Portraits Day 1",
                "Product Promo",
                "2026-06-05T09:00:00Z to 2026-06-05T12:00:00Z"
        );

        DashboardBackupChecklist checklist = new DashboardBackupChecklist(
                UUID.randomUUID(),
                "Corporate Portrait Shoot 2026",
                UUID.randomUUID(),
                "Edited Retouched Photos",
                1,
                "WARNING_LOW_REDUNDANCY",
                "Requires at least 2 distinct backup locations (current: LOCAL_NAS)."
        );

        DashboardSummaryResponse response = new DashboardSummaryResponse(
                stats, List.of(warning), List.of(checklist)
        );

        when(dashboardService.getSummary()).thenReturn(response);

        mockMvc.perform(get("/api/dashboard/summary")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stats.totalClients").value(24))
                .andExpect(jsonPath("$.stats.activeProjects").value(8))
                .andExpect(jsonPath("$.stats.upcomingEventsCount").value(3))
                .andExpect(jsonPath("$.stats.successfulBackupsCount").value(12))
                .andExpect(jsonPath("$.warnings[0].employeeName").value("John Doe"))
                .andExpect(jsonPath("$.warnings[0].eventTitle").value("Studio Portraits Day 1"))
                .andExpect(jsonPath("$.backupChecklists[0].projectName").value("Corporate Portrait Shoot 2026"))
                .andExpect(jsonPath("$.backupChecklists[0].status").value("WARNING_LOW_REDUNDANCY"));

        verify(dashboardService, times(1)).getSummary();
    }
}
