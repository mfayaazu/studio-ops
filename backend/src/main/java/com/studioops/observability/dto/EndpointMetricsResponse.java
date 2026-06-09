package com.studioops.observability.dto;

public class EndpointMetricsResponse {
    private String method;
    private String path;
    private long requestCount;
    private double avgDurationMs;

    public EndpointMetricsResponse() {}

    public EndpointMetricsResponse(String method, String path, long requestCount, double avgDurationMs) {
        this.method = method;
        this.path = path;
        this.requestCount = requestCount;
        this.avgDurationMs = avgDurationMs;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public long getRequestCount() {
        return requestCount;
    }

    public void setRequestCount(long requestCount) {
        this.requestCount = requestCount;
    }

    public double getAvgDurationMs() {
        return avgDurationMs;
    }

    public void setAvgDurationMs(double avgDurationMs) {
        this.avgDurationMs = avgDurationMs;
    }
}
