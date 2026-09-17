package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.config.WompiProperties;
import com.example.elitedriverbackend.domain.entity.*;
import com.example.elitedriverbackend.repositories.ReservationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.anyMap;

class PaymentServiceTest {
    private final ReservationRepository repository = mock(ReservationRepository.class);
    private final WompiClient client = mock(WompiClient.class);
    private final WompiProperties properties = new WompiProperties();
    private final ObjectMapper mapper = new ObjectMapper();
    private PaymentService service;
    private Reservation reservation;
    private final String appId = UUID.randomUUID().toString();
    private final UsernamePasswordAuthenticationToken owner =
            new UsernamePasswordAuthenticationToken("customer@example.com", null, List.of());

    @BeforeEach
    void setup() throws Exception {
        properties.setEnabled(true);
        properties.setAppId(appId);
        properties.setApiSecret("test-secret-for-signatures");
        properties.setWebhookUrl("https://example.com/api/payments/wompi/webhook");
        properties.setRedirectUrl("https://example.com/customer/my-reservations");
        service = new PaymentService(repository, client, properties, mapper);
        reservation = Reservation.builder().id(UUID.randomUUID())
                .startDate(java.sql.Date.valueOf("2026-10-01")).endDate(java.sql.Date.valueOf("2026-10-04"))
                .user(User.builder().email(owner.getName()).build())
                .vehicle(Vehicle.builder().name("Sedán").pricePerDay(new BigDecimal("99.99")).build())
                .totalPrice(new BigDecimal("59.97")).paymentStatus(PaymentStatus.PENDING).build();
        when(repository.findForPayment(reservation.getId())).thenReturn(Optional.of(reservation));
        when(repository.findById(reservation.getId())).thenReturn(Optional.of(reservation));
        when(client.checkEnvironment()).thenReturn(new WompiClient.Environment(appId, false));
        when(client.createLink(anyMap())).thenReturn(mapper.readTree("""
                {"idEnlace":123,"urlEnlace":"https://lk.wompi.sv/test","urlQrCodeEnlace":"https://example.com/qr.png","estaProductivo":false}
                """));
        when(client.getLink(123L)).thenReturn(mapper.readTree(
                "{\"idEnlace\":123,\"idAplicativo\":\"" + appId + "\",\"transaccionCompra\":null}"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void chargesStoredReservationAmountAndDisablesEditingAndRepeatPayments() {
        var result = service.createLink(reservation.getId(), owner);
        var captor = org.mockito.ArgumentCaptor.forClass(Map.class);
        verify(client).createLink(captor.capture());
        Map<String, Object> payload = captor.getValue();
        assertThat(payload.get("monto")).isEqualTo(new BigDecimal("59.97"));
        assertThat(payload.get("identificadorEnlaceComercio")).isEqualTo("ELITEDRIVER-" + reservation.getId());
        assertThat((Map<String, Object>) payload.get("configuracion"))
                .containsEntry("esMontoEditable", false).containsEntry("esCantidadEditable", false)
                .containsEntry("cantidadPorDefecto", 1).containsEntry("urlWebhook", properties.getWebhookUrl());
        assertThat((Map<String, Object>) payload.get("limitesDeUso")).containsEntry("cantidadMaximaPagosExitosos", 1);
        assertThat(result.amount()).isEqualByComparingTo("59.97");
        assertThat(result.production()).isFalse();
    }

    @Test
    void reusesPersistedLink() {
        service.createLink(reservation.getId(), owner);
        var result = service.createLink(reservation.getId(), owner);
        verify(client, times(1)).createLink(anyMap());
        assertThat(result.paymentUrl()).isEqualTo("https://lk.wompi.sv/test");
    }

    @Test
    void deniesAnotherCustomersPaymentBeforeCallingProvider() {
        var other = new UsernamePasswordAuthenticationToken("other@example.com", null, List.of());
        assertThatThrownBy(() -> service.createLink(reservation.getId(), other))
                .isInstanceOfSatisfying(ResponseStatusException.class, ex -> assertThat(ex.getStatusCode().value()).isEqualTo(403));
        assertThatThrownBy(() -> service.getStatus(reservation.getId(), other)).isInstanceOf(ResponseStatusException.class);
        verifyNoInteractions(client);
    }

    @Test
    void requiresNotificationDestinationBeforeCreatingLink() {
        properties.setWebhookUrl("");
        assertThatThrownBy(() -> service.createLink(reservation.getId(), owner)).isInstanceOf(ResponseStatusException.class);
        verify(client, never()).createLink(anyMap());
    }

    @Test
    void deactivatesLinkWhenModeChangesDuringCreation() throws Exception {
        when(client.createLink(anyMap())).thenReturn(mapper.readTree("""
                {"idEnlace":123,"urlEnlace":"https://lk.wompi.sv/test","estaProductivo":true}
                """));
        assertThatThrownBy(() -> service.createLink(reservation.getId(), owner)).isInstanceOf(ResponseStatusException.class);
        verify(client).deactivateLink(123L);
        verify(repository, never()).save(any());
    }

    @Test
    void signedWebhookMarksTestPaymentAndDuplicateIsIdempotent() throws Exception {
        service.createLink(reservation.getId(), owner);
        clearInvocations(repository);
        byte[] body = event("59.97", false, appId, 123);
        service.processWebhook(body, sign(body));
        service.processWebhook(body, sign(body));
        assertThat(reservation.getPaymentStatus()).isEqualTo(PaymentStatus.PAID_TEST);
        assertThat(reservation.getPaymentTransactionId()).isEqualTo("test-transaction");
        assertThat(reservation.getPaidAt()).isNotNull();
        verify(repository, times(1)).save(reservation);
    }

    @Test
    void signedWebhookMarksProductionPaymentSeparately() throws Exception {
        when(client.checkEnvironment()).thenReturn(new WompiClient.Environment(appId, true));
        when(client.createLink(anyMap())).thenReturn(mapper.readTree("""
                {"idEnlace":123,"urlEnlace":"https://lk.wompi.sv/test","estaProductivo":true}
                """));
        service.createLink(reservation.getId(), owner);
        byte[] body = event("59.97", true, appId, 123);
        service.processWebhook(body, sign(body));
        assertThat(reservation.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    void validatesSignatureAgainstExactBytes() throws Exception {
        service.createLink(reservation.getId(), owner);
        byte[] body = event("59.97", false, appId, 123);
        byte[] changed = (new String(body, StandardCharsets.UTF_8) + " ").getBytes(StandardCharsets.UTF_8);
        assertThatThrownBy(() -> service.processWebhook(changed, sign(body)))
                .isInstanceOfSatisfying(ResponseStatusException.class, ex -> assertThat(ex.getStatusCode().value()).isEqualTo(401));
        assertThatThrownBy(() -> service.processWebhook(body, null)).isInstanceOf(ResponseStatusException.class);
        assertThat(reservation.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
    }

    @Test
    void rejectsSignedWrongAmountApplicationLinkOrMode() throws Exception {
        service.createLink(reservation.getId(), owner);
        for (byte[] body : List.of(event("0.01", false, appId, 123), event("59.97", false, "another-app", 123),
                event("59.97", false, appId, 456), event("59.97", true, appId, 123))) {
            assertThatThrownBy(() -> service.processWebhook(body, sign(body))).isInstanceOf(ResponseStatusException.class);
        }
        assertThat(reservation.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
    }

    @Test
    void readsCamelCaseAndNumericApprovedResult() throws Exception {
        service.createLink(reservation.getId(), owner);
        String json = new String(event("59.97", false, appId, 123), StandardCharsets.UTF_8)
                .replace("\"ResultadoTransaccion\":\"ExitosaAprobada\"", "\"resultadoTransaccion\":0")
                .replace("\"Monto\"", "\"monto\"").replace("\"EnlacePago\"", "\"enlacePago\"");
        byte[] body = json.getBytes(StandardCharsets.UTF_8);
        service.processWebhook(body, sign(body));
        assertThat(reservation.getPaymentStatus()).isEqualTo(PaymentStatus.PAID_TEST);
    }

    @Test
    void declineDoesNotMarkPaid() throws Exception {
        service.createLink(reservation.getId(), owner);
        byte[] body = new String(event("59.97", false, appId, 123), StandardCharsets.UTF_8)
                .replace("ExitosaAprobada", "ExitosaDeclinada").getBytes(StandardCharsets.UTF_8);
        service.processWebhook(body, sign(body));
        assertThat(reservation.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
    }

    @Test
    void cancellationDeactivatesLinkAndKeepsReferenceForDelayedWebhooks() {
        service.createLink(reservation.getId(), owner);
        doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY)).when(client).deactivateLink(123L);
        assertThatThrownBy(() -> service.cancel(reservation.getId(), owner)).isInstanceOf(ResponseStatusException.class);
        verify(repository, never()).delete(any());
        doNothing().when(client).deactivateLink(123L);
        service.cancel(reservation.getId(), owner);
        verify(repository, never()).delete(any());
        assertThat(reservation.getPaymentStatus()).isEqualTo(PaymentStatus.CANCELLED);
    }

    @Test
    void paidReservationsCannotBeChargedAgainOrDeleted() {
        reservation.setPaymentStatus(PaymentStatus.PAID_TEST);
        assertThatThrownBy(() -> service.createLink(reservation.getId(), owner)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> service.cancel(reservation.getId(), owner)).isInstanceOf(ResponseStatusException.class);
        verifyNoInteractions(client);
        verify(repository, never()).delete(any());
    }

    @Test
    void retrievesConfirmedPaymentFromWompiWithoutPublicWebhook() throws Exception {
        service.createLink(reservation.getId(), owner);
        when(client.getLink(123L)).thenReturn(mapper.readTree(
                "{\"idEnlace\":123,\"idAplicativo\":\"" + appId + "\",\"transaccionCompra\":" +
                "{\"esAprobada\":true,\"esReal\":false,\"montoOriginal\":59.97,\"idTransaccion\":\"api-transaction\"}}"));
        var response = service.getStatus(reservation.getId(), owner);
        assertThat(response.paymentStatus()).isEqualTo(PaymentStatus.PAID_TEST);
        assertThat(reservation.getPaymentTransactionId()).isEqualTo("api-transaction");
    }

    @Test
    void rejectsPaymentFromAnotherLinkDuringSynchronization() throws Exception {
        service.createLink(reservation.getId(), owner);
        when(client.getLink(123L)).thenReturn(mapper.readTree("{\"idEnlace\":999,\"idAplicativo\":\"" + appId + "\"}"));
        assertThatThrownBy(() -> service.getStatus(reservation.getId(), owner)).isInstanceOf(ResponseStatusException.class);
        assertThat(reservation.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
    }

    @Test
    void retainsDelayedApprovedPaymentAfterCancellation() throws Exception {
        service.createLink(reservation.getId(), owner);
        service.cancel(reservation.getId(), owner);
        byte[] body = event("59.97", false, appId, 123);
        service.processWebhook(body, sign(body));
        assertThat(reservation.getPaymentStatus()).isEqualTo(PaymentStatus.PAID_TEST);
    }

    private byte[] event(String amount, boolean production, String application, int linkId) {
        return ("""
                {"Monto":%s,"ResultadoTransaccion":"ExitosaAprobada","IdTransaccion":"test-transaction",
                "EsProductiva":%s,"Aplicativo":{"Id":"%s"},
                "EnlacePago":{"Id":%d,"IdentificadorEnlaceComercio":"ELITEDRIVER-%s"}}
                """).formatted(amount, production, application, linkId, reservation.getId()).getBytes(StandardCharsets.UTF_8);
    }

    private String sign(byte[] body) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(properties.getApiSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(body));
    }
}
