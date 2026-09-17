package com.example.elitedriverbackend.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.*;

class ReservationPricingTest {
    @Test
    void multipliesCalendarDaysWithoutFloatingPointErrors() {
        assertThat(ReservationPricing.total(LocalDate.parse("2026-10-01"), LocalDate.parse("2026-10-04"), new BigDecimal("19.99")))
                .isEqualTo(new BigDecimal("59.97"));
        assertThat(ReservationPricing.total(java.sql.Date.valueOf("2026-10-01"), java.sql.Date.valueOf("2026-10-04"), new BigDecimal("19.99")))
                .isEqualTo(new BigDecimal("59.97"));
    }

    @Test
    void rejectsReversedOrZeroLengthRentalsAndInvalidPrices() {
        LocalDate start = LocalDate.parse("2026-10-01");
        assertThatThrownBy(() -> ReservationPricing.total(start, start, BigDecimal.TEN)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> ReservationPricing.total(start, start.minusDays(1), BigDecimal.TEN)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> ReservationPricing.total(start, start.plusDays(1), BigDecimal.ZERO)).isInstanceOf(ResponseStatusException.class);
    }
}
