package com.example.elitedriverbackend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/** Install the PostgreSQL safeguard after JPA initialization, on new and existing databases. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class ReservationIntegrityInitializer implements ApplicationRunner {
    private final JdbcTemplate jdbc;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws IOException {
        try (var stream = new ClassPathResource("db/vehicle-availability.sql").getInputStream()) {
            jdbc.execute(new String(stream.readAllBytes(), StandardCharsets.UTF_8));
        }
        try (var stream = new ClassPathResource("db/reservation-integrity.sql").getInputStream()) {
            // Send the complete script: its DO block contains SQL semicolons.
            jdbc.execute(new String(stream.readAllBytes(), StandardCharsets.UTF_8));
        }
    }
}
