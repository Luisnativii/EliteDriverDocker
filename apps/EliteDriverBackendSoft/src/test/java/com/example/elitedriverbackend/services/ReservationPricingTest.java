package com.example.elitedriverbackend.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.*;

class ReservationPricingTest {
    @Test
    void multipliesCalendarDaysWithoutFloatingPointErrors() {
        // Precios base + IVA 13%: 19.99 x 3 = 59.97 subtotal, 67.77 total
        assertThat(ReservationPricing.total(LocalDate.parse("2026-10-01"), LocalDate.parse("2026-10-04"), new BigDecimal("19.99")))
                .isEqualTo(new BigDecimal("67.77"));
        assertThat(ReservationPricing.total(java.sql.Date.valueOf("2026-10-01"), java.sql.Date.valueOf("2026-10-04"), new BigDecimal("19.99")))
                .isEqualTo(new BigDecimal("67.77"));
    }

    @Test
    void rejectsReversedOrZeroLengthRentalsAndInvalidPrices() {
        LocalDate start = LocalDate.parse("2026-10-01");
        assertThatThrownBy(() -> ReservationPricing.total(start, start, BigDecimal.TEN)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> ReservationPricing.total(start, start.minusDays(1), BigDecimal.TEN)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> ReservationPricing.total(start, start.plusDays(1), BigDecimal.ZERO)).isInstanceOf(ResponseStatusException.class);
    }
}
