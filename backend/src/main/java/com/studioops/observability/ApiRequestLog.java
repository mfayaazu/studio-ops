package com.studioops.observability;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "api_request_log")
public class ApiRequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "request_id", length = 100)
    private String requestId;

    @Column(name = "method", nullable = false, length = 20)
    private String method;

    @Column(name = "path", nullable = false, length = 500)
    private String path;

    @Column(name = "status_code", nullable = false)
    private Integer statusCode;

    @Column(name = "duration_ms", nullable = false)
    private Long durationMs;

    @Column(name = "user_email", length = 255)
    private String userEmail;

    @Column(name = "studio_id")
    private UUID studioId;

    @Column(name = "remote_ip", length = 100)
    private String remoteIp;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
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

    public Integer getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }

    public Long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(Long durationMs) {
        this.durationMs = durationMs;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public UUID getStudioId() {
        return studioId;
    }

    public void setStudioId(UUID studioId) {
        this.studioId = studioId;
    }

    public String getRemoteIp() {
        return remoteIp;
    }

    public void setRemoteIp(String remoteIp) {
        this.remoteIp = remoteIp;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
