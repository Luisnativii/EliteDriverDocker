package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.domain.entity.*;
import com.example.elitedriverbackend.domain.dtos.VehicleUnavailabilityDTO;
import com.example.elitedriverbackend.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor
public class VehicleAvailabilityService {
    private final VehicleRepository vehicles;
    private final VehicleUnavailabilityRepository periods;
    private final ReservationRepository reservations;
    private final ReservationHoldService holds;
    private final Clock rentalClock;

    public void requireAvailable(Vehicle vehicle, LocalDate start, LocalDate end) {
        if (vehicle.getStatus() != VehicleStatus.active || periods.overlaps(vehicle.getId(), start, end)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El vehículo está fuera de servicio para las fechas seleccionadas.");
        }
    }

    @Transactional
    public VehicleUnavailabilityDTO add(UUID vehicleId, VehicleUnavailabilityDTO dto) {
        if (dto.getStartDate() == null || dto.getEndDate() == null || dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona un rango de fechas válido.");
        }
        if (dto.getEndDate().isBefore(LocalDate.now(rentalClock))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El período no puede terminar en el pasado.");
        }
        holds.expireNow(Instant.now(rentalClock));
        Vehicle vehicle = lock(vehicleId);
        if (periods.overlaps(vehicleId, dto.getStartDate(), dto.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un período fuera de servicio en esas fechas.");
        }
        if (!reservations.findByVehicleIdAndDateOverlap(vehicleId, java.sql.Date.valueOf(dto.getStartDate()), java.sql.Date.valueOf(dto.getEndDate())).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El vehículo tiene reservas en esas fechas. Resuélvelas antes de bloquearlo.");
        }
        return dto(periods.save(VehicleUnavailability.builder().vehicle(vehicle).startDate(dto.getStartDate())
                .endDate(dto.getEndDate()).reason(dto.getReason() == null ? null : dto.getReason().trim()).build()));
    }

    @Transactional
    public void remove(UUID vehicleId, UUID periodId) {
        lock(vehicleId);
        VehicleUnavailability period = periods.findById(periodId)
                .filter(p -> p.getVehicle().getId().equals(vehicleId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Período no encontrado."));
        periods.delete(period);
    }

    public Vehicle lock(UUID id) {
        return vehicles.findForReservation(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehículo no encontrado."));
    }

    public static VehicleUnavailabilityDTO dto(VehicleUnavailability period) {
        return VehicleUnavailabilityDTO.builder().id(period.getId()).startDate(period.getStartDate())
                .endDate(period.getEndDate()).reason(period.getReason()).build();
    }
}
