package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.config.ReservationHoldProperties;
import com.example.elitedriverbackend.domain.entity.PaymentStatus;
import com.example.elitedriverbackend.domain.entity.Reservation;
import com.example.elitedriverbackend.repositories.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * La pre-reserva retiene el vehículo solo durante la ventana de pago.
 * Antes no vencía nunca: una reserva abandonada bloqueaba el auto para siempre.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ReservationHoldServiceTest {

    @Mock
    ReservationRepository reservations;

    @InjectMocks
    ReservationHoldService service;

    ReservationHoldProperties properties = new ReservationHoldProperties();

    @BeforeEach
    void setUp() {
        properties.setSweepMillis(60_000L);
        org.springframework.test.util.ReflectionTestUtils.setField(service, "properties", properties);
    }

    private Reservation pendiente(Instant vence) {
        return Reservation.builder()
                .paymentStatus(PaymentStatus.PENDING)
                .holdExpiresAt(vence)
                .build();
    }

    @Test
    void unaReservaNuevaVenceEnLosMinutosConfigurados() {
        Instant ahora = Instant.parse("2026-10-16T12:00:00Z");
        Instant vence = service.newExpiry(ahora);
        assertEquals(10, ChronoUnit.MINUTES.between(ahora, vence));
    }

    @Test
    void elTiempoConfiguradoCambiaElVencimiento() {
        properties.setHoldMinutes(120);
        Instant ahora = Instant.now();
        assertEquals(120, ChronoUnit.MINUTES.between(ahora, service.newExpiry(ahora)));
    }

    @Test
    void conCeroMinutosNoVenceNunca() {
        properties.setHoldMinutes(0);
        assertFalse(properties.isEnabled());
        assertNull(service.newExpiry(Instant.now()), "sin expiracion no debe fijar vencimiento");
    }

    @Test
    void unaReservaVencidaSeCancelaYLiberaElVehiculo() {
        Instant ahora = Instant.now();
        Reservation vencida = pendiente(ahora.minus(1, ChronoUnit.MINUTES));
        when(reservations.findExpiredHolds(eq(ahora), any(Pageable.class)))
                .thenReturn(List.of(vencida));

        int liberadas = service.expireNow(ahora);

        assertEquals(1, liberadas);
        // CANCELLED es el estado que la restriccion del banco excluye: el auto vuelve.
        assertEquals(PaymentStatus.CANCELLED, vencida.getPaymentStatus());
    }

    @Test
    void unaReservaQueAlcanzoAPagarNoSeTocaAlBarrer() {
        when(reservations.findExpiredHolds(any(Instant.class), any(Pageable.class)))
                .thenReturn(List.of());
        assertEquals(0, service.expireNow(Instant.now()));
    }

    @Test
    void detectaSiElBloqueoYaVencio() {
        Instant ahora = Instant.now();
        assertTrue(service.isHoldExpired(pendiente(ahora.minus(5, ChronoUnit.MINUTES)), ahora));
        assertFalse(service.isHoldExpired(pendiente(ahora.plus(5, ChronoUnit.MINUTES)), ahora));
    }

    @Test
    void venceExactamenteALosDiezMinutosYNoAntes() {
        Instant inicio = Instant.parse("2026-10-20T12:00:00Z");
        Instant vence = service.newExpiry(inicio);
        Reservation reserva = pendiente(vence);
        assertFalse(service.isHoldExpired(reserva, inicio.plusSeconds(599)));
        assertTrue(service.isHoldExpired(reserva, inicio.plusSeconds(600)));
        reserva.setPaymentStatus(PaymentStatus.CANCELLED);
        assertTrue(service.isRenewable(reserva, vence));
        assertEquals(vence.plusSeconds(600), service.newExpiry(vence));
    }

    @Test
    void unaReservaPagadaNoTieneElBloqueoVencido() {
        Reservation pagada = Reservation.builder()
                .paymentStatus(PaymentStatus.PAID)
                .holdExpiresAt(Instant.now().minus(1, ChronoUnit.DAYS))
                .build();
        assertFalse(service.isHoldExpired(pagada, Instant.now()));
    }

    @Test
    void soloSeRenuevaLoQueElTiempoCerró() {
        Instant ahora = Instant.now();
        // Cerrada por el tiempo: tiene vencimiento y se puede reactivar.
        Reservation vencida = Reservation.builder()
                .paymentStatus(PaymentStatus.CANCELLED)
                .holdExpiresAt(ahora.minus(10, ChronoUnit.MINUTES))
                .build();
        assertTrue(service.isRenewable(vencida, ahora));

        // Cancelada a mano: sin vencimiento, no se revive.
        Reservation manual = Reservation.builder()
                .paymentStatus(PaymentStatus.CANCELLED)
                .holdExpiresAt(null)
                .build();
        assertFalse(service.isRenewable(manual, ahora));
    }

    @Test
    void unaReservaPagadaNoSeRenueva() {
        Reservation pagada = Reservation.builder()
                .paymentStatus(PaymentStatus.PAID)
                .holdExpiresAt(Instant.now().minus(1, ChronoUnit.DAYS))
                .build();
        assertFalse(service.isRenewable(pagada, Instant.now()));
    }
}