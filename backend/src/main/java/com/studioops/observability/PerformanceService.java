package com.studioops.observability;

import com.studioops.observability.dto.EndpointMetricsResponse;
import com.studioops.observability.dto.PerformanceSummaryResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PerformanceService {

    private static final Logger log = LoggerFactory.getLogger(PerformanceService.class);

    private final ApiRequestLogRepository requestLogRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public PerformanceService(ApiRequestLogRepository requestLogRepository) {
        this.requestLogRepository = requestLogRepository;
    }

    @Transactional(readOnly = true)
    public PerformanceSummaryResponse getPerformanceSummary() {
        OffsetDateTime sinceMidnight = OffsetDateTime.now().with(LocalTime.MIN);

        PerformanceSummaryResponse summary = new PerformanceSummaryResponse();
        summary.setTotalRequestsToday(requestLogRepository.countRequestsSince(sinceMidnight));
        summary.setAverageResponseMsToday(requestLogRepository.getAverageResponseMsSince(sinceMidnight));
        summary.setP95ResponseMsToday(requestLogRepository.getP95ResponseMsSince(sinceMidnight));
        summary.setErrorCountToday(requestLogRepository.countErrorsSince(sinceMidnight));
        summary.setSlowRequestCountToday(requestLogRepository.countSlowRequestsSince(sinceMidnight));
        summary.setDbHealth(checkDbHealth());
        summary.setLastUpdated(OffsetDateTime.now());

        return summary;
    }

    @Transactional(readOnly = true)
    public List<EndpointMetricsResponse> getTopEndpointsByVolume() {
        OffsetDateTime past24Hours = OffsetDateTime.now().minusHours(24);
        List<Object[]> rawMetrics = requestLogRepository.getTopEndpointsByVolume(past24Hours);
        return mapToEndpointMetricsResponse(rawMetrics);
    }

    @Transactional(readOnly = true)
    public List<EndpointMetricsResponse> getTopSlowestEndpoints() {
        OffsetDateTime past24Hours = OffsetDateTime.now().minusHours(24);
        List<Object[]> rawMetrics = requestLogRepository.getTopSlowestEndpoints(past24Hours);
        return mapToEndpointMetricsResponse(rawMetrics);
    }

    @Transactional(readOnly = true)
    public List<ApiRequestLog> getRecentErrors() {
        return requestLogRepository.getRecentErrors();
    }

    @Transactional(readOnly = true)
    public List<ApiRequestLog> getRecentSlowRequests() {
        return requestLogRepository.getRecentSlowRequests();
    }

    /**
     * Daily retention task running at midnight to delete log entries older than 14 days.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void runLogCleanup() {
        OffsetDateTime threshold = OffsetDateTime.now().minusDays(14);
        log.info("Running API request log retention cleanup task. Deleting logs older than: {}", threshold);
        try {
            requestLogRepository.deleteLogsOlderThan(threshold);
            log.info("API request log retention cleanup completed successfully.");
        } catch (Exception e) {
            log.error("Failed to run api request log retention cleanup", e);
        }
    }

    private String checkDbHealth() {
        try {
            entityManager.createNativeQuery("SELECT 1").getSingleResult();
            return "UP";
        } catch (Exception e) {
            log.error("Database health check failed", e);
            return "DOWN";
        }
    }

    private List<EndpointMetricsResponse> mapToEndpointMetricsResponse(List<Object[]> rawMetrics) {
        return rawMetrics.stream().map(row -> {
            String method = (String) row[0];
            String path = (String) row[1];
            long count = ((Number) row[2]).longValue();
            double avgDuration = 0;
            if (row[3] != null) {
                if (row[3] instanceof BigDecimal) {
                    avgDuration = ((BigDecimal) row[3]).doubleValue();
                } else {
                    avgDuration = ((Number) row[3]).doubleValue();
                }
            }
            return new EndpointMetricsResponse(method, path, count, avgDuration);
        }).collect(Collectors.toList());
    }
}
