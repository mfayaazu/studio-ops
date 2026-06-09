package com.studioops.observability;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface ApiRequestLogRepository extends JpaRepository<ApiRequestLog, UUID> {

    @Query(value = "SELECT COUNT(*) FROM api_request_log WHERE created_at >= :since AND path NOT LIKE '/api/health%' AND path NOT LIKE '/api/platform-admin/performance%'", nativeQuery = true)
    long countRequestsSince(@Param("since") OffsetDateTime since);

    @Query(value = "SELECT COALESCE(AVG(duration_ms), 0) FROM api_request_log WHERE created_at >= :since AND path NOT LIKE '/api/health%' AND path NOT LIKE '/api/platform-admin/performance%'", nativeQuery = true)
    double getAverageResponseMsSince(@Param("since") OffsetDateTime since);

    @Query(value = "SELECT COALESCE(percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms), 0) FROM api_request_log WHERE created_at >= :since AND path NOT LIKE '/api/health%' AND path NOT LIKE '/api/platform-admin/performance%'", nativeQuery = true)
    double getP95ResponseMsSince(@Param("since") OffsetDateTime since);

    @Query(value = "SELECT COUNT(*) FROM api_request_log WHERE status_code >= 400 AND created_at >= :since AND path NOT LIKE '/api/health%' AND path NOT LIKE '/api/platform-admin/performance%'", nativeQuery = true)
    long countErrorsSince(@Param("since") OffsetDateTime since);

    @Query(value = "SELECT COUNT(*) FROM api_request_log WHERE duration_ms >= 1000 AND created_at >= :since AND path NOT LIKE '/api/health%' AND path NOT LIKE '/api/platform-admin/performance%'", nativeQuery = true)
    long countSlowRequestsSince(@Param("since") OffsetDateTime since);

    @Query(value = "SELECT method, path, COUNT(*) as request_count, ROUND(AVG(duration_ms)) as avg_duration_ms " +
                   "FROM api_request_log " +
                   "WHERE created_at >= :since AND path NOT LIKE '/api/health%' AND path NOT LIKE '/api/platform-admin/performance%' " +
                   "GROUP BY method, path " +
                   "ORDER BY request_count DESC LIMIT 10", nativeQuery = true)
    List<Object[]> getTopEndpointsByVolume(@Param("since") OffsetDateTime since);

    @Query(value = "SELECT method, path, COUNT(*) as request_count, ROUND(AVG(duration_ms)) as avg_duration_ms " +
                   "FROM api_request_log " +
                   "WHERE created_at >= :since AND path NOT LIKE '/api/health%' AND path NOT LIKE '/api/platform-admin/performance%' " +
                   "GROUP BY method, path " +
                   "ORDER BY avg_duration_ms DESC LIMIT 10", nativeQuery = true)
    List<Object[]> getTopSlowestEndpoints(@Param("since") OffsetDateTime since);

    @Query(value = "SELECT * FROM api_request_log " +
                   "WHERE status_code >= 400 AND path NOT LIKE '/api/health%' AND path NOT LIKE '/api/platform-admin/performance%' " +
                   "ORDER BY created_at DESC LIMIT 20", nativeQuery = true)
    List<ApiRequestLog> getRecentErrors();

    @Query(value = "SELECT * FROM api_request_log " +
                   "WHERE duration_ms >= 1000 AND path NOT LIKE '/api/health%' AND path NOT LIKE '/api/platform-admin/performance%' " +
                   "ORDER BY created_at DESC LIMIT 20", nativeQuery = true)
    List<ApiRequestLog> getRecentSlowRequests();

    @Modifying
    @Query(value = "DELETE FROM api_request_log WHERE created_at < :threshold", nativeQuery = true)
    void deleteLogsOlderThan(@Param("threshold") OffsetDateTime threshold);
}
