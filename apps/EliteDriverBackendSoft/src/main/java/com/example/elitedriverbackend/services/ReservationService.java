package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.domain.dtos.CreateReservationDTO;
import com.example.elitedriverbackend.domain.entity.Reservation;
import com.example.elitedriverbackend.domain.entity.PaymentStatus;
import com.example.elitedriverbackend.domain.entity.User;
import com.example.elitedriverbackend.domain.entity.Vehicle;
import com.example.elitedriverbackend.domain.entity.VehicleType;
import com.example.elitedriverbackend.repositories.ReservationRepository;
import com.example.elitedriverbackend.repositories.UserRepository;
import com.example.elitedriverbackend.repositories.VehicleRepository;
import com.example.elitedriverbackend.repositories.VehicleTypeRepository;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Clock;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/*
    Servicio para manejar la lógica de negocio relacionada con las reservas de vehículos.
    Proporciona métodos para crear, eliminar y consultar reservas.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final Clock rentalClock;

    /*
        Crea una nueva reserva si el vehículo no está ya reservado en el rango de fechas especificado.
        Recibe un DTO con los datos necesarios para crear la reserva.
        Retorna la reserva creada.
        Si el vehículo ya está reservado en ese rango, lanza una excepción.
     */
    @Transactional
    public Reservation addReservation(CreateReservationDTO createReservationDTO, Authentication authentication) {

        User user = userRepository.findById(UUID.fromString(createReservationDTO.getUserId()))
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean admin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (authentication == null || (!admin && !user.getEmail().equalsIgnoreCase(authentication.getName()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes crear una reserva para otro usuario.");
        }

        LocalDate start = createReservationDTO.getStartDate();
        LocalDate end = createReservationDTO.getEndDate();
        if (start == null || end == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Las fechas de inicio y fin son requeridas.");
        }
        if (start.isBefore(LocalDate.now(rentalClock))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha de inicio no puede ser anterior a hoy.");
        }

        // Serialize bookings for this vehicle until the transaction commits.
        // Lock before reading availability, including the first reservation.
        Vehicle vehicle = vehicleRepository.findForReservation(UUID.fromString(createReservationDTO.getVehicleId()))
                .orElseThrow(() -> new RuntimeException("Vehiculo no encontrado"));
        var totalPrice = ReservationPricing.total(start, end, vehicle.getPricePerDay());

        Date startDate = java.sql.Date.valueOf(start);
        Date endDate = java.sql.Date.valueOf(end);



        // Validar si ya está reservado en ese rango
        List<Reservation> overlappingReservations = reservationRepository
                .findByVehicleIdAndDateOverlap(vehicle.getId(), startDate, endDate);

        if (!overlappingReservations.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "❌ Este vehículo ya está reservado en el rango de fechas seleccionado"
            );
        }


        Reservation newReservation = new Reservation();
        newReservation.setStartDate(startDate);
        newReservation.setEndDate(endDate);
        newReservation.setUser(user);
        newReservation.setVehicle(vehicle);
        newReservation.setTotalPrice(totalPrice);
        newReservation.setPaymentStatus(PaymentStatus.PENDING);
        return reservationRepository.saveAndFlush(newReservation);
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll().stream()
                .filter(r -> r.getPaymentStatus() != PaymentStatus.CANCELLED).toList();
    }

    public List<Reservation> getReservationsForAvailability(Date startDate, Date endDate) {
        return reservationRepository.findOverlapping(startDate, endDate);
    }

    /*
        Obtiene una reserva por su ID.
        Si la reserva no existe, lanza una excepción.
     */
    public Reservation getReservationById(UUID id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva con id " + id + " no encontrada"));
    }


    /*
        Obtiene las reservas que caen dentro de un rango de fechas especificado.
        Retorna la lista de reservas en ese rango.
     */
    public List<Reservation> getReservationByRange(Date startDate, Date endDate) {
        try {
            return reservationRepository.findOverlapping(startDate, endDate);
        }catch (Exception e){
            throw new RuntimeException("Error obteniendo reservas: " + e.getMessage(), e);
        }
    }

    /*
        Obtiene las reservas asociadas a un usuario específico por su ID.
        Retorna la lista de reservas del usuario.
     */
    public List<Reservation> getReservationByUser(UUID user) {
        try {
            return reservationRepository.findByUser_Id(user).stream()
                    .filter(reservation -> reservation.getPaymentStatus() != PaymentStatus.CANCELLED)
                    .toList();
        } catch (Exception e) {
            throw new RuntimeException("Error obteniendo reservas por usuario: " + e.getMessage(), e);
        }
    }

    /*
        Obtiene las reservas asociadas a un vehículo específico por su ID.
        Retorna la lista de reservas del vehículo.
     */
    public List<Reservation> getReservationByVehicle(UUID vehicle) {
        try {
            return reservationRepository.findByVehicle_Id(vehicle);
        } catch (Exception e) {
            throw new RuntimeException("Error obteniendo reservas por vehículo: " + e.getMessage(), e);
        }
    }

    /*
        Obtiene las reservas asociadas a un tipo de vehículo específico.
        Retorna la lista de reservas del tipo de vehículo.
     */
    public List<Reservation> getReservationByVehicleType(String vehicleType) {
        try {
            VehicleType type = vehicleTypeRepository.findByType(vehicleType)
                    .orElseThrow(() -> new RuntimeException("Tipo de vehículo no encontrado"));
            return reservationRepository.findByVehicle_VehicleType(type);
        } catch (Exception e) {
            throw new RuntimeException("Error obteniendo reservas por tipo de vehículo: " + e.getMessage(), e);
        }
    }
}
