package com.example.elitedriverbackend.controller;

import com.example.elitedriverbackend.domain.entity.*;
import com.example.elitedriverbackend.services.PaymentService;
import com.example.elitedriverbackend.services.ReservationService;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.NullSource;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ReservationControllerTest {
    @ParameterizedTest
    @EnumSource(PaymentStatus.class)
    @NullSource
    void reservationApiOnlyConfirmsRealApprovedPayments(PaymentStatus payment) throws Exception {
        var reservations = mock(ReservationService.class);
        var controller = new ReservationController(reservations, mock(PaymentService.class));
        var reservation = Reservation.builder().id(UUID.randomUUID())
                .startDate(Date.valueOf("2026-10-01")).endDate(Date.valueOf("2026-10-04"))
                .totalPrice(new BigDecimal("59.97")).paymentStatus(payment)
                .user(User.builder().id(UUID.randomUUID()).firstName("Cliente").email("customer@example.com").build())
                .vehicle(Vehicle.builder().id(UUID.randomUUID()).name("Sedán")
                        .pricePerDay(new BigDecimal("19.99"))
                        .vehicleType(VehicleType.builder().type("Sedán").build()).build()).build();
        when(reservations.getAllReservations()).thenReturn(List.of(reservation));
        String status = payment == PaymentStatus.PAID ? "confirmado"
                : payment == PaymentStatus.PAID_TEST ? "prueba_aprobada"
                : payment == PaymentStatus.CANCELLED ? "cancelado" : "pendiente_pago";
        MockMvcBuilders.standaloneSetup(controller).build().perform(get("/api/reservations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value(status))
                .andExpect(jsonPath("$[0].paymentStatus").value(payment == null ? "PENDING" : payment.name()));
    }
}
