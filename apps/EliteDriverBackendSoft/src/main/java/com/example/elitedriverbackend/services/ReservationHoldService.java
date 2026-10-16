package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.config.ReservationHoldProperties;
import com.example.elitedriverbackend.domain.entity.PaymentStatus;
import com.example.elitedriverbackend.domain.entity.Reservation;
import com.example.elitedriverbackend.repositories.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Libera los vehículos que quedaron bloqueados por reservas sin pagar.
 *
 * Antes, una reserva abandonada retinia el auto indefinidamente: nadie la
 * cancelaba y la restricción del banco la seguía contando como activa.
 *
 * Vencida la ventana se marcan CANCELLED, que es el estado que la restricción
 * {@code reservations_no_active_overlap} excluye, así que el auto vuelve al
 * catálogo sin tocar la base de datos a mano.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationHoldService {

    private final ReservationRepository reservations;
    private final ReservationHoldProperties properties;

    /**
     * Instante de vencimiento para una reserva nueva o renovada.
     * Con la expiración desactivada devuelve null: no vence nunca.
     */
    public Instant newExpiry(Instant from) {
        if (!properties.isEnabled()) return null;
        return from.plusSeconds(properties.getHoldMinutes() * 60L);
    }

    /** Reserva pendiente cuyo bloqueo ya venció. */
    @Transactional(readOnly = true)
    public List<Reservation> findExpired(Instant now, int limit) {
        return reservations.findExpiredHolds(now, PageRequest.of(0, limit));
    }

    /**
     * Cancela las reservas vencidas. Se ejecuta cada minuto y también cuando
     * alguien consulta, para que el catálogo no quede desactualizado.
     */
    @Scheduled(fixedDelayString = "${app.reservation.sweep-millis:60000}")
    public void releaseExpiredHolds() {
        if (!properties.isEnabled()) return;
        try {
            expireNow(Instant.now());
        } catch (Exception ex) {
            // Nunca dejar que la tarea programada tumbe la aplicación.
            log.warn("No se pudieron liberar las reservas vencidas: {}", ex.getMessage());
        }
    }

    /** Cantidad liberada en esta pasada. */
    @Transactional
    public int expireNow(Instant now) {
        if (!properties.isEnabled()) return 0;
        List<Reservation> vencidas = reservations.findExpiredHolds(now, PageRequest.of(0, 500));
        if (vencidas.isEmpty()) return 0;
        for (Reservation r : vencidas) {
            r.setPaymentStatus(PaymentStatus.CANCELLED);
        }
        reservations.saveAll(vencidas);
        log.info("Se liberaron {} reservas sin pagar; sus vehículos vuelven al catálogo", vencidas.size());
        return vencidas.size();
    }

    /** ¿Esta reserva perdió su bloqueo por tiempo? */
    public boolean isHoldExpired(Reservation reservation, Instant now) {
        return reservation.getHoldExpiresAt() != null
                && reservation.getHoldExpiresAt().isBefore(now)
                && reservation.getPaymentStatus() == PaymentStatus.PENDING;
    }

    /**
     * Una reserva cancelada que tenía vencimiento es recuperable: fue el tiempo
     * el que la cerró, no la persona. Si se canceló a mano, holdExpiresAt queda
     * en null y no se revive.
     */
    public boolean isRenewable(Reservation reservation, Instant now) {
        return reservation.getPaymentStatus() == PaymentStatus.CANCELLED
                && reservation.getHoldExpiresAt() != null
                && reservation.getHoldExpiresAt().isBefore(now);
    }
}