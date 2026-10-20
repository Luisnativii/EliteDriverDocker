package com.example.elitedriverbackend.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.*;

class ReservationPricingTest {
    @Test
    void multipliesCalendarDaysWithoutFloatingPointErrors() {
        // Tarifa con IVA incluido: 19.99 x 3 = 59.97 total, sin recargo
        assertThat(ReservationPricing.total(LocalDate.parse("2026-10-01"), LocalDate.parse("2026-10-04"), new BigDecimal("19.99")))
                .isEqualTo(new BigDecimal("59.97"));
        assertThat(ReservationPricing.total(java.sql.Date.valueOf("2026-10-01"), java.sql.Date.valueOf("2026-10-04"), new BigDecimal("19.99")))
                .isEqualTo(new BigDecimal("59.97"));
    }

    @Test
    void publishedDailyPriceIsFinalForOneOrSeveralDays() {
        LocalDate start = LocalDate.parse("2026-10-20");
        BigDecimal price = new BigDecimal("29.99");
        assertThat(ReservationPricing.total(start, start.plusDays(1), price)).isEqualTo(new BigDecimal("29.99"));
        assertThat(ReservationPricing.total(start, start.plusDays(3), price)).isEqualTo(new BigDecimal("89.97"));
        assertThat(ReservationPricing.total(start, start.plusDays(7), price)).isEqualTo(new BigDecimal("209.93"));
    }

    @Test
    void rejectsReversedOrZeroLengthRentalsAndInvalidPrices() {
        LocalDate start = LocalDate.parse("2026-10-01");
        assertThatThrownBy(() -> ReservationPricing.total(start, start, BigDecimal.TEN)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> ReservationPricing.total(start, start.minusDays(1), BigDecimal.TEN)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> ReservationPricing.total(start, start.plusDays(1), BigDecimal.ZERO)).isInstanceOf(ResponseStatusException.class);
    }
}
