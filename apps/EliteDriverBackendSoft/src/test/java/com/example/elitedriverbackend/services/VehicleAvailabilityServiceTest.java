package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.domain.dtos.VehicleUnavailabilityDTO;
import com.example.elitedriverbackend.domain.entity.*;
import com.example.elitedriverbackend.repositories.*;
import org.junit.jupiter.api.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class VehicleAvailabilityServiceTest {
    private final VehicleRepository vehicles = mock(VehicleRepository.class);
    private final VehicleUnavailabilityRepository periods = mock(VehicleUnavailabilityRepository.class);
    private final ReservationRepository reservations = mock(ReservationRepository.class);
    private final ReservationHoldService holds = mock(ReservationHoldService.class);
    private final Clock clock = Clock.fixed(Instant.parse("2026-10-20T18:00:00Z"), ZoneId.of("America/El_Salvador"));
    private final VehicleAvailabilityService service = new VehicleAvailabilityService(vehicles, periods, reservations, holds, clock);
    private final UUID id = UUID.randomUUID();
    private final LocalDate start = LocalDate.of(2038, 1, 10);
    private final LocalDate end = start.plusDays(3);
    private Vehicle vehicle;
    private VehicleUnavailabilityDTO request;

    @BeforeEach void setup() {
        vehicle = Vehicle.builder().id(id).status(VehicleStatus.active).build();
        request = VehicleUnavailabilityDTO.builder().startDate(start).endDate(end).reason("  Uso interno  ").build();
        when(vehicles.findForReservation(id)).thenReturn(Optional.of(vehicle));
        when(reservations.findByVehicleIdAndDateOverlap(any(), any(), any())).thenReturn(List.of());
        when(periods.save(any())).thenAnswer(i -> { VehicleUnavailability p = i.getArgument(0);p.setId(UUID.randomUUID());return p; });
    }
    @Test void activeVehicleIsAvailableOutsideBlockedDates() {
        assertDoesNotThrow(() -> service.requireAvailable(vehicle, start, end));
    }
    @Test void inactiveVehicleCannotBeReserved() {
        vehicle.setStatus(VehicleStatus.outOfService);
        assertEquals(409, assertThrows(ResponseStatusException.class, () -> service.requireAvailable(vehicle,start,end)).getStatusCode().value());
    }
    @Test void overlappingPeriodPreventsReservation() {
        when(periods.overlaps(id,start,end)).thenReturn(true);
        assertThrows(ResponseStatusException.class, () -> service.requireAvailable(vehicle,start,end));
    }
    @Test void locksVehicleBeforeCreatingPeriodAndTrimsInternalReason() {
        var saved=service.add(id,request);
        assertNotNull(saved.getId());assertEquals("Uso interno",saved.getReason());
        var order=inOrder(vehicles,periods,reservations);
        order.verify(vehicles).findForReservation(id);order.verify(periods).overlaps(id,start,end);
        order.verify(reservations).findByVehicleIdAndDateOverlap(id,java.sql.Date.valueOf(start),java.sql.Date.valueOf(end));
        order.verify(periods).save(any());
    }
    @Test void aSingleDayCanBeBlocked() {
        request.setEndDate(start);
        assertEquals(start,service.add(id,request).getEndDate());
    }
    @Test void invalidAndPastRangesAreRejectedWithoutWriting() {
        request.setEndDate(start.minusDays(1));assertThrows(ResponseStatusException.class,()->service.add(id,request));
        request.setStartDate(LocalDate.of(2020,1,1));request.setEndDate(LocalDate.of(2020,1,2));
        assertThrows(ResponseStatusException.class,()->service.add(id,request));verify(periods,never()).save(any());
    }
    @Test void existingReservationsAndOtherPeriodsCannotBeOverwritten() {
        when(reservations.findByVehicleIdAndDateOverlap(any(),any(),any())).thenReturn(List.of(new Reservation()));
        assertThrows(ResponseStatusException.class,()->service.add(id,request));verify(periods,never()).save(any());
        when(periods.overlaps(id,start,end)).thenReturn(true);
        assertThrows(ResponseStatusException.class,()->service.add(id,request));verify(periods,never()).save(any());
    }
    @Test void cannotRemoveAnotherVehiclesPeriod() {
        UUID periodId=UUID.randomUUID();
        var other=Vehicle.builder().id(UUID.randomUUID()).build();
        when(periods.findById(periodId)).thenReturn(Optional.of(VehicleUnavailability.builder().vehicle(other).build()));
        assertThrows(ResponseStatusException.class,()->service.remove(id,periodId));verify(periods,never()).delete(any());
    }
    @Test void removingOwnPeriodRestoresDateAvailability() {
        UUID periodId=UUID.randomUUID();
        var period=VehicleUnavailability.builder().vehicle(vehicle).build();
        when(periods.findById(periodId)).thenReturn(Optional.of(period));
        service.remove(id,periodId);verify(periods).delete(period);
    }
}
