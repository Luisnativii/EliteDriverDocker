package com.example.elitedriverbackend.repositories;

import com.example.elitedriverbackend.domain.entity.Vehicle;
import com.example.elitedriverbackend.domain.entity.VehicleStatus;
import com.example.elitedriverbackend.domain.entity.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    // Lock the parent even when there are no reservations to lock yet.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Vehicle v WHERE v.id = :id")
    Optional<Vehicle> findForReservation(@Param("id") UUID id);

    List<Vehicle> findByVehicleType(VehicleType vehicleType);
    long countBySupplier_Id(UUID supplierId);
    @Query("SELECT v.supplier.id, COUNT(v) FROM Vehicle v WHERE v.supplier IS NOT NULL GROUP BY v.supplier.id")
    List<Object[]> countBySupplier();

}
