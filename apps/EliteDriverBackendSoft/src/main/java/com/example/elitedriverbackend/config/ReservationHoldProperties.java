package com.example.elitedriverbackend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Reglas de la pre-reserva.
 *
 * Una reserva sin pagar retiene el vehículo durante hold-minutes para que la
 * persona tenga tiempo de completar el pago. Al vencer se libera sola y el
 * auto vuelve al catálogo.
 *
 * holdMinutes = 0 desactiva la expiración (el comportamiento anterior, en el
 * que una reserva abandonada bloqueaba el auto indefinidamente).
 */
@ConfigurationProperties(prefix = "app.reservation")
public class ReservationHoldProperties {

    /** Minutos que una reserva PENDING retiene el vehículo. 0 = sin expiración. */
    private int holdMinutes = 30;

    /** Cada cuánto revisan las reservas vencidas, en milisegundos. */
    private long sweepMillis = 60_000L;

    public int getHoldMinutes() {
        return holdMinutes;
    }

    public void setHoldMinutes(int holdMinutes) {
        this.holdMinutes = Math.max(0, holdMinutes);
    }

    public long getSweepMillis() {
        return sweepMillis;
    }

    public void setSweepMillis(long sweepMillis) {
        this.sweepMillis = Math.max(5_000L, sweepMillis);
    }

    public boolean isEnabled() {
        return holdMinutes > 0;
    }
}