package com.example.elitedriverbackend.services;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Date;

public final class ReservationPricing {
    private ReservationPricing() {}

    /** IVA El Salvador 13%. Precios publicados son base + IVA. */
    public static final java.math.BigDecimal IVA_RATE = new java.math.BigDecimal("0.13");

    public static BigDecimal total(LocalDate start, LocalDate end, BigDecimal pricePerDay) {
        long days = ChronoUnit.DAYS.between(start, end);
        if (days <= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "La fecha de fin debe ser posterior a la fecha de inicio.");
        if (pricePerDay == null || pricePerDay.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El vehículo no tiene una tarifa válida.");
        }
        BigDecimal subtotal = pricePerDay.multiply(BigDecimal.valueOf(days));
        BigDecimal total = subtotal.multiply(java.math.BigDecimal.ONE.add(IVA_RATE)).setScale(2, RoundingMode.HALF_UP);
        if (total.signum() <= 0 || total.precision() > 12) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El monto de la reserva no es válido.");
        }
        return total;
    }

    public static BigDecimal total(Date start, Date end, BigDecimal pricePerDay) {
        return total(date(start), date(end), pricePerDay);
    }

    private static LocalDate date(Date value) {
        return value instanceof java.sql.Date sqlDate ? sqlDate.toLocalDate()
                : Instant.ofEpochMilli(value.getTime()).atZone(ZoneOffset.UTC).toLocalDate();
    }
}
