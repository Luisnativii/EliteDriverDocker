package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.config.RentalTimeConfiguration;
import com.example.elitedriverbackend.domain.dtos.CreateReservationDTO;
import com.example.elitedriverbackend.domain.entity.*;
import com.example.elitedriverbackend.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReservationServiceTest {
    private final ReservationRepository reservations = mock(ReservationRepository.class);
    private final VehicleRepository vehicles = mock(VehicleRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final VehicleTypeRepository types = mock(VehicleTypeRepository.class);
    private final UUID userId = UUID.randomUUID();
    private final UUID vehicleId = UUID.randomUUID();
    private final User user = User.builder().id(userId).email("customer@example.test").build();
    private final Vehicle vehicle = Vehicle.builder().id(vehicleId).pricePerDay(new BigDecimal("29.99")).build();
    private final UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken("customer@example.test", "unused", List.of());

    private ReservationService serviceAt(String instant) {
        return new ReservationService(reservations, users, vehicles, types,
                Clock.fixed(Instant.parse(instant), RentalTimeConfiguration.RENTAL_ZONE));
    }

    private CreateReservationDTO dates(String start, String end) {
        return CreateReservationDTO.builder().userId(userId.toString()).vehicleId(vehicleId.toString())
                .startDate(LocalDate.parse(start)).endDate(LocalDate.parse(end)).build();
    }

    @BeforeEach
    void setUp() {
        when(users.findById(userId)).thenReturn(Optional.of(user));
    }

    @Test
    void locksVehicleBeforeCheckingOverlapAndPersistsTheServerPrice() {
        when(vehicles.findForReservation(vehicleId)).thenReturn(Optional.of(vehicle));
        when(reservations.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        var saved = serviceAt("2026-10-16T15:00:00Z")
                .addReservation(dates("2026-11-20", "2026-11-23"), auth);
        assertEquals(new BigDecimal("101.67"), saved.getTotalPrice());
        assertEquals(PaymentStatus.PENDING, saved.getPaymentStatus());
        var ordered = inOrder(vehicles, reservations);
        ordered.verify(vehicles).findForReservation(vehicleId);
        ordered.verify(reservations).findByVehicleIdAndDateOverlap(eq(vehicleId), any(), any());
        ordered.verify(reservations).saveAndFlush(any());
    }

    @Test
    void rejectsOverlapWithoutSaving() {
        when(vehicles.findForReservation(vehicleId)).thenReturn(Optional.of(vehicle));
        when(reservations.findByVehicleIdAndDateOverlap(eq(vehicleId), any(), any()))
                .thenReturn(List.of(new Reservation()));
        var error = assertThrows(ResponseStatusException.class, () -> serviceAt("2026-10-16T15:00:00Z")
                .addReservation(dates("2026-11-20", "2026-11-23"), auth));
        assertEquals(400, error.getStatusCode().value());
        verify(reservations, never()).saveAndFlush(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"2026-10-17T00:00:00Z", "2026-10-17T01:00:00Z", "2026-10-17T05:59:59Z"})
    void acceptsTodayUntilMidnightInTheBusinessZone(String instant) {
        when(vehicles.findForReservation(vehicleId)).thenReturn(Optional.of(vehicle));
        assertDoesNotThrow(() -> serviceAt(instant)
                .addReservation(dates("2026-10-16", "2026-10-17"), auth));
        verify(reservations).saveAndFlush(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"2026-10-17T06:00:00Z", "2026-10-17T18:00:00Z"})
    void rejectsYesterdayFromLocalMidnight(String instant) {
        var error = assertThrows(ResponseStatusException.class, () -> serviceAt(instant)
                .addReservation(dates("2026-10-16", "2026-10-18"), auth));
        assertEquals(400, error.getStatusCode().value());
        verifyNoInteractions(vehicles, reservations);
    }

    @Test
    void rejectsDistantPastAndDoesNotAcquireVehicleLock() {
        assertThrows(ResponseStatusException.class, () -> serviceAt("2026-10-16T15:00:00Z")
                .addReservation(dates("2001-01-10", "2001-01-13"), auth));
        verifyNoInteractions(vehicles, reservations);
    }

    @Test
    void availabilityAndAdministrativeRangeUseTheSameOverlapQuery() {
        var start = java.sql.Date.valueOf("2026-11-11");
        var end = java.sql.Date.valueOf("2026-11-12");
        var matches = List.of(new Reservation());
        when(reservations.findOverlapping(start, end)).thenReturn(matches);
        var service = serviceAt("2026-10-16T15:00:00Z");
        assertSame(matches, service.getReservationsForAvailability(start, end));
        assertSame(matches, service.getReservationByRange(start, end));
    }
}
