package com.example.elitedriverbackend.controller;

import com.example.elitedriverbackend.domain.dtos.CreateReservationDTO;
import com.example.elitedriverbackend.domain.dtos.ReservationAvailabilityDTO;
import com.example.elitedriverbackend.domain.dtos.ReservationResponseDTO;
import com.example.elitedriverbackend.domain.entity.Reservation;
import com.example.elitedriverbackend.domain.entity.PaymentStatus;
import com.example.elitedriverbackend.repositories.UserRepository;
import com.example.elitedriverbackend.services.ReservationService;
import com.example.elitedriverbackend.services.PaymentService;
import com.example.elitedriverbackend.services.ReservationPricing;
import org.springframework.security.core.Authentication;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/*
    Controlador para gestionar las reservas de vehículos.
    Proporciona endpoints para crear, obtener, listar y eliminar reservas.
 */
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Slf4j
public class ReservationController {

    private final ReservationService reservationService;
    private final PaymentService paymentService;
    private final UserRepository userRepository;

    private static boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private static void requireOwnerOrAdmin(Reservation reservation, Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado.");
        }
        if (isAdmin(authentication)) return;
        if (reservation.getUser() != null && reservation.getUser().getEmail() != null
                && reservation.getUser().getEmail().equalsIgnoreCase(authentication.getName())) return;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes ver esta reserva.");
    }

    /*
        Endpoint para crear una nueva reserva.
        Recibe un DTO con los datos de la reserva y devuelve un DTO con los detalles de la reserva creada.
     */
    @PostMapping
    public ResponseEntity<ReservationResponseDTO> addReservation(@Valid @RequestBody CreateReservationDTO dto, Authentication authentication) {
        Reservation reservation = reservationService.addReservation(dto, authentication);
        ReservationResponseDTO responseDTO = convertToDTO(reservation);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }


    /*
        Endpoint para obtener una reserva por su ID.
        Devuelve la reserva correspondiente si existe.
        Si no existe, lanza una excepción.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponseDTO> getReservation(@PathVariable String id, Authentication authentication) {
        UUID uuid = parseUUID(id);
        Reservation reservation = reservationService.getReservationById(uuid);
        requireOwnerOrAdmin(reservation, authentication);
        return ResponseEntity.ok(convertToDTO(reservation));

    }

    /*
        Método auxiliar para convertir un String en UUID.
     */
    private UUID parseUUID(String id) {
        return UUID.fromString(id);
    }




    /*
        Endpoint para obtener todas las reservas.
        Devuelve una lista de DTOs con los detalles de todas las reservas.
     */
    @GetMapping
    public ResponseEntity<List<ReservationResponseDTO>> getAllReservations() {
            List<Reservation> reservations = reservationService.getAllReservations();

            List<ReservationResponseDTO> reservationDTOs = reservations.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(reservationDTOs);
    }

    /*
        Método auxiliar para convertir una entidad Reservation en un DTO ReservationResponseDTO.
     */
    private ReservationResponseDTO convertToDTO(Reservation reservation) {
        if (reservation.getVehicle() == null) {
            throw new EntityNotFoundException("Reservation con id " + reservation.getId() + " no tiene vehículo asociado");
        }

        double pricePerDay = reservation.getVehicle().getPricePerDay().doubleValue();
        double totalPrice = (reservation.getTotalPrice() != null ? reservation.getTotalPrice()
                : ReservationPricing.total(reservation.getStartDate(), reservation.getEndDate(),
                reservation.getVehicle().getPricePerDay())).doubleValue();

        return ReservationResponseDTO.builder()
                .id(String.valueOf(reservation.getId()))
                .startDate(reservation.getStartDate())
                .endDate(reservation.getEndDate())
                .status(reservation.getPaymentStatus() == PaymentStatus.PAID ? "confirmado"
                        : reservation.getPaymentStatus() == PaymentStatus.PAID_TEST ? "prueba_aprobada"
                        : reservation.getPaymentStatus() == PaymentStatus.CANCELLED ? "cancelado" : "pendiente_pago")
                .totalPrice(totalPrice) // ✅ Usar el cálculo
                .paymentStatus(reservation.getPaymentStatus() == null ? PaymentStatus.PENDING.name() : reservation.getPaymentStatus().name())
                .user(ReservationResponseDTO.UserInfo.builder()
                        .id(String.valueOf(reservation.getUser().getId()))
                        .firstName(reservation.getUser().getFirstName())
                        .lastName(reservation.getUser().getLastName())
                        .email(reservation.getUser().getEmail())
                        .dui(reservation.getUser().getDui())
                        .build())
                .vehicle(ReservationResponseDTO.VehicleInfo.builder()
                        .id(String.valueOf(reservation.getVehicle().getId()))
                        .name(reservation.getVehicle().getName())
                        .brand(reservation.getVehicle().getBrand())
                        .model(reservation.getVehicle().getModel())
                        .capacity(reservation.getVehicle().getCapacity())
                        .mainImageUrl(reservation.getVehicle().getMainImageUrl())
                        .vehicleType(reservation.getVehicle().getVehicleType().getType())
                        .pricePerDay(pricePerDay)
                        .build())
                .build();
    }


    /*
        Endpoint para obtener reservas dentro de un rango de fechas.
        Recibe las fechas de inicio y fin como parámetros y devuelve una lista de DTOs con los detalles de las reservas en ese rango.
     */
    /*
        Vista pública de disponibilidad: SIN PII (sin usuario/DUI/email).
        La página pública /customer/vehicles debe migrar a este endpoint.
        GET /api/reservations/availability?startDate=dd-MM-yyyy&endDate=dd-MM-yyyy
     */
    @GetMapping("/availability")
    public ResponseEntity<List<ReservationAvailabilityDTO>> getAvailability(
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) throws ParseException {
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
        dateFormat.setLenient(false);
        Date startDate = dateFormat.parse(startDateStr);
        Date endDate = dateFormat.parse(endDateStr);
        if (startDate.after(endDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha de inicio no puede ser posterior a la fecha de fin");
        }
        List<Reservation> reservations = reservationService.getReservationsForAvailability(startDate, endDate);
        List<ReservationAvailabilityDTO> dtos = reservations.stream()
                .map(r -> ReservationAvailabilityDTO.builder()
                        .vehicleId(String.valueOf(r.getVehicle().getId()))
                        .startDate(r.getStartDate())
                        .endDate(r.getEndDate())
                        .status(r.getPaymentStatus() == null ? PaymentStatus.PENDING.name() : r.getPaymentStatus().name())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /*
        Rango con detalle: requiere login. ADMIN ve PII, CUSTOMER solo ve ocupación sin usuario.
     */
    @GetMapping("/date")
    public ResponseEntity<?> getReservationByRange(@RequestParam("startDate") String startDateStr,
                                                                    @RequestParam("endDate") String endDateStr,
                                                                    Authentication authentication) throws ParseException {

            SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
            dateFormat.setLenient(false);
            Date startDate = dateFormat.parse(startDateStr);
            Date endDate = dateFormat.parse(endDateStr);

            if(startDate.after(endDate)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha de inicio no puede ser posterior a la fecha de fin");
            }
            List<Reservation> reservations = reservationService.getReservationByRange(startDate, endDate);
            if (isAdmin(authentication)) {
                List<ReservationResponseDTO> dtos = reservations.stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList());
                return ResponseEntity.ok(dtos);
            }
            // No-admin: misma ocupación pero sin PII
            List<ReservationAvailabilityDTO> pub = reservations.stream()
                    .map(r -> ReservationAvailabilityDTO.builder()
                            .vehicleId(String.valueOf(r.getVehicle().getId()))
                            .startDate(r.getStartDate())
                            .endDate(r.getEndDate())
                            .status(r.getPaymentStatus() == null ? PaymentStatus.PENDING.name() : r.getPaymentStatus().name())
                            .build())
                    .collect(Collectors.toList());
            return ResponseEntity.ok(pub);

    }

    /*
        Endpoint para obtener reservas por ID de usuario.
        Solo el dueño o ADMIN. Se resuelve el dueño por email del token, no solo por userId.
     */
    @GetMapping("/user")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationByUser(@RequestParam("userId") String userId, Authentication authentication) {
            UUID uuid = parseUUID(userId);
            if (!isAdmin(authentication)) {
                var me = userRepository.findByEmail(authentication.getName()).orElse(null);
                if (me == null || !me.getId().equals(uuid)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes ver reservas de otro usuario.");
                }
            }

            List<Reservation> reservations = reservationService.getReservationByUser(uuid);

            List<ReservationResponseDTO> reservationDTOs = reservations.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(reservationDTOs);
    }



    @GetMapping("/vehicle")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationByVehicle(@RequestParam("vehicleId") String vehicleId, Authentication authentication) {
            if (!isAdmin(authentication)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo administradores.");
            }
            UUID uuid = parseUUID(vehicleId);
            List<Reservation> reservations = reservationService.getReservationByVehicle(uuid);
            return ResponseEntity.ok(reservations.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @GetMapping("/vehicleType")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationByVehicleType(@RequestParam("vehicleType") String vehicleType, Authentication authentication) {
            if (!isAdmin(authentication)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo administradores.");
            }
            List<Reservation> reservations = reservationService.getReservationByVehicleType(vehicleType);
            return ResponseEntity.ok(reservations.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable String id, Authentication authentication) {
        UUID uuid = parseUUID(id);
        paymentService.cancel(uuid, authentication);
        return ResponseEntity.ok().build();
    }

}
