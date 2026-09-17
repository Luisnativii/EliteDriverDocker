package com.example.elitedriverbackend.domain.dtos;

import com.example.elitedriverbackend.domain.entity.PaymentStatus;
import java.math.BigDecimal;
import java.util.UUID;

public record PaymentLinkResponseDTO(UUID reservationId, BigDecimal amount, String currency,
        PaymentStatus paymentStatus, String paymentUrl, String qrCodeUrl, Boolean production) {
}
