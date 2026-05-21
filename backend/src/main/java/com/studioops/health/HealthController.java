package com.studioops.health;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", Instant.now().toString());

        Map<String, String> services = new HashMap<>();
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            statement.executeQuery("SELECT 1");
            services.put("database", "UP");
        } catch (Exception e) {
            health.put("status", "DOWN");
            services.put("database", "DOWN");
            health.put("error", e.getMessage());
        }
        health.put("services", services);

        if ("DOWN".equals(health.get("status"))) {
            return ResponseEntity.status(500).body(health);
        }
        return ResponseEntity.ok(health);
    }
}
