package com.example.elitedriverbackend.repositories;

import com.example.elitedriverbackend.domain.entity.VehicleUnavailability;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;

public interface VehicleUnavailabilityRepository extends JpaRepository<VehicleUnavailability, UUID> {
    List<VehicleUnavailability> findByVehicle_IdOrderByStartDateAsc(UUID vehicleId);
    @Query("SELECT b FROM VehicleUnavailability b WHERE b.startDate <= :end AND b.endDate >= :start")
    List<VehicleUnavailability> findOverlapping(@Param("start") LocalDate start, @Param("end") LocalDate end);
    @Query("SELECT COUNT(b) > 0 FROM VehicleUnavailability b WHERE b.vehicle.id = :vehicleId AND b.startDate <= :end AND b.endDate >= :start")
    boolean overlaps(@Param("vehicleId") UUID vehicleId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
