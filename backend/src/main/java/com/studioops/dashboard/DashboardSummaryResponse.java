package com.studioops.dashboard;

import java.util.List;

public class DashboardSummaryResponse {
    private DashboardStats stats;
    private List<DashboardWarning> warnings;
    private List<DashboardBackupChecklist> backupChecklists;

    public DashboardSummaryResponse() {
    }

    public DashboardSummaryResponse(DashboardStats stats, List<DashboardWarning> warnings, List<DashboardBackupChecklist> backupChecklists) {
        this.stats = stats;
        this.warnings = warnings;
        this.backupChecklists = backupChecklists;
    }

    public DashboardStats getStats() {
        return stats;
    }

    public void setStats(DashboardStats stats) {
        this.stats = stats;
    }

    public List<DashboardWarning> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<DashboardWarning> warnings) {
        this.warnings = warnings;
    }

    public List<DashboardBackupChecklist> getBackupChecklists() {
        return backupChecklists;
    }

    public void setBackupChecklists(List<DashboardBackupChecklist> backupChecklists) {
        this.backupChecklists = backupChecklists;
    }
}
