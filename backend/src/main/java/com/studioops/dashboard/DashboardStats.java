package com.studioops.dashboard;

public class DashboardStats {
    private long totalClients;
    private long activeProjects;
    private long upcomingEventsCount;
    private long successfulBackupsCount;

    public DashboardStats() {
    }

    public DashboardStats(long totalClients, long activeProjects, long upcomingEventsCount, long successfulBackupsCount) {
        this.totalClients = totalClients;
        this.activeProjects = activeProjects;
        this.upcomingEventsCount = upcomingEventsCount;
        this.successfulBackupsCount = successfulBackupsCount;
    }

    public long getTotalClients() {
        return totalClients;
    }

    public void setTotalClients(long totalClients) {
        this.totalClients = totalClients;
    }

    public long getActiveProjects() {
        return activeProjects;
    }

    public void setActiveProjects(long activeProjects) {
        this.activeProjects = activeProjects;
    }

    public long getUpcomingEventsCount() {
        return upcomingEventsCount;
    }

    public void setUpcomingEventsCount(long upcomingEventsCount) {
        this.upcomingEventsCount = upcomingEventsCount;
    }

    public long getSuccessfulBackupsCount() {
        return successfulBackupsCount;
    }

    public void setSuccessfulBackupsCount(long successfulBackupsCount) {
        this.successfulBackupsCount = successfulBackupsCount;
    }
}
