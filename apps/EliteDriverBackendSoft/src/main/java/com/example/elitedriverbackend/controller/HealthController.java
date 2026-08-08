package com.example.elitedriverbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        try {
            Integer databaseResult = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            if (databaseResult == null || databaseResult != 1) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("status", "DOWN", "database", "DOWN"));
            }

            return ResponseEntity.ok(Map.of("status", "UP", "database", "UP"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                            "status", "DOWN",
                            "database", "DOWN",
                            "error", ex.getClass().getSimpleName()
                    ));
        }
    }
}
