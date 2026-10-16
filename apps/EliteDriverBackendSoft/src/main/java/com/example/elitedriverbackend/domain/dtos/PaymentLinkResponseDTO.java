package com.example.elitedriverbackend.domain.dtos;

import com.example.elitedriverbackend.domain.entity.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentLinkResponseDTO(UUID reservationId, BigDecimal amount, String currency,
        PaymentStatus paymentStatus, String paymentUrl, String qrCodeUrl, Boolean production,
        Instant holdExpiresAt) {

    /**
     * Constructor de compatibilidad para las llamadas que no necesitan exponer
     * la ventana de pago (por ejemplo, al consultar el estado de un pago ya hecho).
     */
    public PaymentLinkResponseDTO(UUID reservationId, BigDecimal amount, String currency,
            PaymentStatus paymentStatus, String paymentUrl, String qrCodeUrl, Boolean production) {
        this(reservationId, amount, currency, paymentStatus, paymentUrl, qrCodeUrl, production, null);
    }
}