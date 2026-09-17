package com.example.elitedriverbackend.repositories;

import com.example.elitedriverbackend.domain.entity.Reservation;
import com.example.elitedriverbackend.domain.entity.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Reservation r WHERE r.id = :id")
    Optional<Reservation> findForPayment(@Param("id") UUID id);
    List<Reservation> findByStartDateBetween(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
    List<Reservation> findByVehicle_VehicleType(VehicleType vehicleType);
    @Query("SELECT r FROM Reservation r WHERE r.vehicle.id = :vehicleId AND " +
            "(r.paymentStatus IS NULL OR r.paymentStatus <> com.example.elitedriverbackend.domain.entity.PaymentStatus.CANCELLED) AND " +
            "(:startDate <= r.endDate AND :endDate >= r.startDate)")
    List<Reservation> findByVehicleIdAndDateOverlap(
            @Param("vehicleId") UUID vehicleId,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate);

}
