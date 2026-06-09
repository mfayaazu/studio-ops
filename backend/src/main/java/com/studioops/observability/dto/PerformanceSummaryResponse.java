package com.studioops.observability.dto;

import java.time.OffsetDateTime;

public class PerformanceSummaryResponse {
    private long totalRequestsToday;
    private double averageResponseMsToday;
    private double p95ResponseMsToday;
    private long errorCountToday;
    private long slowRequestCountToday;
    private String dbHealth;
    private OffsetDateTime lastUpdated;

    public long getTotalRequestsToday() {
        return totalRequestsToday;
    }

    public void setTotalRequestsToday(long totalRequestsToday) {
        this.totalRequestsToday = totalRequestsToday;
    }

    public double getAverageResponseMsToday() {
        return averageResponseMsToday;
    }

    public void setAverageResponseMsToday(double averageResponseMsToday) {
        this.averageResponseMsToday = averageResponseMsToday;
    }

    public double getP95ResponseMsToday() {
        return p95ResponseMsToday;
    }

    public void setP95ResponseMsToday(double p95ResponseMsToday) {
        this.p95ResponseMsToday = p95ResponseMsToday;
    }

    public long getErrorCountToday() {
        return errorCountToday;
    }

    public void setErrorCountToday(long errorCountToday) {
        this.errorCountToday = errorCountToday;
    }

    public long getSlowRequestCountToday() {
        return slowRequestCountToday;
    }

    public void setSlowRequestCountToday(long slowRequestCountToday) {
        this.slowRequestCountToday = slowRequestCountToday;
    }

    public String getDbHealth() {
        return dbHealth;
    }

    public void setDbHealth(String dbHealth) {
        this.dbHealth = dbHealth;
    }

    public OffsetDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(OffsetDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
