package com.example.elitedriverbackend.services;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminCustomerServiceTest {
    final Clock clock=Clock.fixed(Instant.parse("2026-11-01T05:59:59Z"),ZoneId.of("America/El_Salvador"));
    final AdminCustomerService service=new AdminCustomerService(null,null,clock,null);
    @Test void currentMonthUsesElSalvadorBeforeUtcMidnightBoundary() { assertEquals(YearMonth.of(2026,10),service.month(null)); }
    @Test void supportsPreviousMonthsAndYearBoundaries() { assertEquals(YearMonth.of(2025,12),service.month("2025-12")); }
    @Test void rejectsInvalidAndFutureMonths() {
        for(String value:new String[]{"wrong","2026-13","2026-11","1899-12"})assertThrows(ResponseStatusException.class,()->service.month(value));
    }
}
