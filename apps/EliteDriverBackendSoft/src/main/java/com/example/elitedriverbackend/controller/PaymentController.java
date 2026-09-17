package com.example.elitedriverbackend.controller;

import com.example.elitedriverbackend.domain.dtos.PaymentLinkResponseDTO;
import com.example.elitedriverbackend.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService payments;

    @PostMapping("/api/reservations/{id}/payment-link")
    public PaymentLinkResponseDTO create(@PathVariable UUID id, Authentication authentication) {
        return payments.createLink(id, authentication);
    }

    @GetMapping("/api/reservations/{id}/payment")
    public PaymentLinkResponseDTO status(@PathVariable UUID id, Authentication authentication) {
        return payments.getStatus(id, authentication);
    }

    @PostMapping("/api/payments/wompi/webhook")
    public ResponseEntity<Void> webhook(@RequestBody byte[] body,
            @RequestHeader(value = "wompi_hash", required = false) String signature) {
        payments.processWebhook(body, signature);
        return ResponseEntity.ok().build();
    }
}
