package com.example.elitedriverbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class RentalTimeConfiguration {
    public static final ZoneId RENTAL_ZONE = ZoneId.of("America/El_Salvador");

    @Bean
    public Clock rentalClock() {
        return Clock.system(RENTAL_ZONE);
    }
}
