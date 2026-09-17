package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.config.WompiProperties;
import com.example.elitedriverbackend.domain.dtos.PaymentLinkResponseDTO;
import com.example.elitedriverbackend.domain.entity.PaymentStatus;
import com.example.elitedriverbackend.domain.entity.Reservation;
import com.example.elitedriverbackend.repositories.ReservationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.net.URI;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final ReservationRepository reservations;
    private final WompiClient wompi;
    private final WompiProperties properties;
    private final ObjectMapper mapper;

    @Transactional
    public PaymentLinkResponseDTO createLink(UUID id, Authentication authentication) {
        Reservation reservation = load(id);
        authorize(reservation, authentication);
        if (reservation.getPaymentStatus() == PaymentStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta reserva está cancelada.");
        }
        if (reservation.getPaymentStatus() == PaymentStatus.PAID || reservation.getPaymentStatus() == PaymentStatus.PAID_TEST) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta reserva ya tiene un pago registrado.");
        }
        wompi.checkConfiguration();
        WompiClient.Environment environment = wompi.checkEnvironment();
        if (reservation.getWompiLinkId() != null) {
            if (!Boolean.valueOf(environment.production()).equals(reservation.getPaymentProduction())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El modo de Wompi cambió después de crear este enlace.");
            }
            synchronize(reservation);
            if (reservation.getPaymentStatus() != PaymentStatus.PENDING) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta reserva ya tiene un pago registrado.");
            }
            return response(reservation);
        }
        if (properties.getWebhookUrl().isBlank() && properties.getNotificationEmails().isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Configura la URL pública de notificaciones de Wompi o el correo del negocio en el servidor.");
        }
        if (reservation.getTotalPrice() == null) {
            reservation.setTotalPrice(ReservationPricing.total(reservation.getStartDate(), reservation.getEndDate(),
                    reservation.getVehicle().getPricePerDay()));
        }
        var config = new LinkedHashMap<String, Object>();
        config.put("esMontoEditable", false);
        config.put("esCantidadEditable", false);
        config.put("cantidadPorDefecto", 1);
        config.put("notificarTransaccionCliente", true);
        if (!properties.getRedirectUrl().isBlank()) {
            validateUrl(properties.getRedirectUrl());
            config.put("urlRedirect", properties.getRedirectUrl());
            config.put("urlRetorno", properties.getRedirectUrl());
        }
        if (!properties.getWebhookUrl().isBlank()) {
            validateUrl(properties.getWebhookUrl());
            config.put("urlWebhook", properties.getWebhookUrl());
        }
        if (!properties.getNotificationEmails().isBlank()) config.put("emailsNotificacion", properties.getNotificationEmails());
        String name = "Alquiler " + reservation.getVehicle().getName();
        JsonNode result = wompi.createLink(Map.of(
                "identificadorEnlaceComercio", "ELITEDRIVER-" + reservation.getId(),
                "monto", reservation.getTotalPrice(),
                "nombreProducto", name.substring(0, Math.min(name.length(), 500)),
                "formaPago", Map.of("permitirTarjetaCreditoDebido", true, "permitirPagoConPuntoAgricola", false,
                        "permitirPagoEnCuotasAgricola", false, "permitirPagoEnBitcoin", false, "permitePagoQuickPay", false),
                "configuracion", config,
                "limitesDeUso", Map.of("cantidadMaximaPagosExitosos", 1)));
        if (result == null || !result.path("idEnlace").canConvertToLong() || result.path("idEnlace").asLong() <= 0
                || result.path("urlEnlace").asText().isBlank() || !result.path("estaProductivo").isBoolean()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Wompi no devolvió un enlace de pago válido.");
        }
        long linkId = result.path("idEnlace").asLong();
        if (result.path("estaProductivo").asBoolean() != environment.production()) {
            wompi.deactivateLink(linkId);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El modo de Wompi cambió al crear el enlace. Revisa el negocio.");
        }
        validateUrl(result.path("urlEnlace").asText());
        reservation.setWompiLinkId(linkId);
        reservation.setWompiApplicationId(environment.applicationId());
        reservation.setPaymentUrl(result.path("urlEnlace").asText());
        reservation.setQrCodeUrl(result.path("urlQrCodeEnlace").asText(null));
        reservation.setPaymentProduction(environment.production());
        reservation.setPaymentStatus(PaymentStatus.PENDING);
        reservations.save(reservation);
        return response(reservation);
    }

    @Transactional
    public PaymentLinkResponseDTO getStatus(UUID id, Authentication authentication) {
        Reservation reservation = load(id);
        authorize(reservation, authentication);
        if (reservation.getWompiLinkId() != null && reservation.getPaymentStatus() == PaymentStatus.PENDING) synchronize(reservation);
        return response(reservation);
    }

    private void synchronize(Reservation reservation) {
        JsonNode link = wompi.getLink(reservation.getWompiLinkId());
        if (link == null || link.path("idEnlace").asLong(-1) != reservation.getWompiLinkId()
                || !link.path("idAplicativo").asText().equalsIgnoreCase(reservation.getWompiApplicationId())) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Wompi devolvió un enlace distinto al de la reserva.");
        }
        JsonNode transaction = link.path("transaccionCompra");
        if (!transaction.path("esAprobada").asBoolean(false)) return;
        JsonNode amount = transaction.path("montoOriginal");
        if (!amount.isNumber()) amount = transaction.path("monto");
        JsonNode production = transaction.path("esReal");
        String id = transaction.path("idTransaccion").asText();
        if (!amount.isNumber() || amount.decimalValue().compareTo(reservation.getTotalPrice()) != 0
                || !production.isBoolean() || !Boolean.valueOf(production.asBoolean()).equals(reservation.getPaymentProduction())
                || id.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "El pago consultado no coincide con la reserva.");
        }
        recordPayment(reservation, id, production.asBoolean());
    }

    @Transactional
    public void cancel(UUID id, Authentication authentication) {
        Reservation reservation = load(id);
        authorize(reservation, authentication);
        if (reservation.getWompiLinkId() != null && reservation.getPaymentStatus() == PaymentStatus.PENDING) synchronize(reservation);
        if (reservation.getPaymentStatus() == PaymentStatus.PAID || reservation.getPaymentStatus() == PaymentStatus.PAID_TEST) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Esta reserva tiene un pago registrado. Contacta al negocio para gestionar su cancelación.");
        }
        if (reservation.getWompiLinkId() != null) {
            wompi.deactivateLink(reservation.getWompiLinkId());
            // Conservar la referencia para recibir pagos cuyo webhook llegue después de la cancelación.
            reservation.setPaymentStatus(PaymentStatus.CANCELLED);
            reservations.save(reservation);
        } else {
            reservations.delete(reservation);
        }
    }

    @Transactional
    public void processWebhook(byte[] body, String signature) {
        wompi.checkConfiguration();
        verifySignature(body, signature);
        JsonNode event;
        try { event = mapper.readTree(body); }
        catch (Exception ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Notificación inválida."); }
        JsonNode link = field(event, "EnlacePago");
        String reference = field(link, "IdentificadorEnlaceComercio").asText();
        if (!reference.startsWith("ELITEDRIVER-")) return; // Otros enlaces del negocio no pertenecen a una reserva.
        UUID id;
        try { id = UUID.fromString(reference.substring("ELITEDRIVER-".length())); }
        catch (IllegalArgumentException ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Referencia inválida."); }
        Reservation reservation = load(id);
        JsonNode amount = field(event, "Monto");
        JsonNode production = field(event, "EsProductiva");
        String transaction = field(event, "IdTransaccion").asText();
        JsonNode result = field(event, "ResultadoTransaccion");
        boolean approved = "ExitosaAprobada".equalsIgnoreCase(result.asText()) || (result.isIntegralNumber() && result.asInt() == 0);
        if (!approved) return;
        if (reservation.getWompiLinkId() == null || field(link, "Id").asLong(-1) != reservation.getWompiLinkId()
                || !field(field(event, "Aplicativo"), "Id").asText().equalsIgnoreCase(reservation.getWompiApplicationId())
                || !amount.isNumber() || amount.decimalValue().compareTo(reservation.getTotalPrice()) != 0
                || !production.isBoolean() || !Boolean.valueOf(production.asBoolean()).equals(reservation.getPaymentProduction())
                || transaction.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El pago no coincide con la reserva.");
        }
        recordPayment(reservation, transaction, production.asBoolean());
    }

    private void recordPayment(Reservation reservation, String transaction, boolean production) {
        if (reservation.getPaymentTransactionId() != null) {
            if (reservation.getPaymentTransactionId().equals(transaction)) return;
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La reserva ya tiene otro pago registrado.");
        }
        reservation.setPaymentTransactionId(transaction);
        reservation.setPaymentStatus(production ? PaymentStatus.PAID : PaymentStatus.PAID_TEST);
        reservation.setPaidAt(Instant.now());
        reservations.save(reservation);
    }

    private void verifySignature(byte[] body, String signature) {
        if (signature == null || !signature.matches("(?i)[0-9a-f]{64}")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firma de Wompi inválida.");
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(properties.getApiSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            if (!MessageDigest.isEqual(mac.doFinal(body), HexFormat.of().parseHex(signature))) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firma de Wompi inválida.");
            }
        } catch (java.security.GeneralSecurityException ex) {
            throw new IllegalStateException("No se pudo validar la firma de Wompi.", ex);
        }
    }

    private static JsonNode field(JsonNode node, String name) {
        if (node != null) {
            var fields = node.fields();
            while (fields.hasNext()) {
                var entry = fields.next();
                if (entry.getKey().equalsIgnoreCase(name)) return entry.getValue();
            }
        }
        return com.fasterxml.jackson.databind.node.MissingNode.getInstance();
    }

    private Reservation load(UUID id) {
        return reservations.findForPayment(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada."));
    }

    private static void authorize(Reservation reservation, Authentication authentication) {
        boolean admin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (authentication == null || (!admin && !reservation.getUser().getEmail().equalsIgnoreCase(authentication.getName()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes gestionar el pago de esta reserva.");
        }
    }

    private static void validateUrl(String value) {
        try {
            URI uri = URI.create(value);
            if (uri.getHost() != null && ("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))) return;
        } catch (IllegalArgumentException ignored) { }
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Una URL de Wompi no es válida. Revisa la configuración del servidor.");
    }

    private static PaymentLinkResponseDTO response(Reservation reservation) {
        return new PaymentLinkResponseDTO(reservation.getId(), reservation.getTotalPrice(), "USD",
                reservation.getPaymentStatus(), reservation.getPaymentUrl(), reservation.getQrCodeUrl(), reservation.getPaymentProduction());
    }
}
