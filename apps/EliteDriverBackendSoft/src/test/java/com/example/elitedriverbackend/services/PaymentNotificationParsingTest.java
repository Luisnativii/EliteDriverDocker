package com.example.elitedriverbackend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Regresión del 16/10/2026: Wompi aprobó un pago de $113 y la aplicación lo
 * rechazó. El log decía "espera 113.00 y Wompi notificó el monto 113.00" y la
 * comparación fallaba igual, porque la notificación llega con el monto como
 * texto y el código solo aceptaba números.
 */
class PaymentNotificationParsingTest {

    private final ObjectMapper mapper = new ObjectMapper();

    private BigDecimal decimalOf(String json) throws Exception {
        Method m = PaymentService.class.getDeclaredMethod("decimalOf", JsonNode.class);
        m.setAccessible(true);
        return (BigDecimal) m.invoke(null, mapper.readTree(json));
    }

    private Boolean boolOf(String json) throws Exception {
        Method m = PaymentService.class.getDeclaredMethod("boolOf", JsonNode.class);
        m.setAccessible(true);
        return (Boolean) m.invoke(null, mapper.readTree(json));
    }

    @Test
    void unMontoEnviadoComoTextoCuentaIgualQueComoNumero() throws Exception {
        BigDecimal esperado = new BigDecimal("113.00");
        // Así es como llegó en el webhook que se rechazó.
        assertEquals(0, decimalOf("\"113.00\"").compareTo(esperado));
        assertEquals(0, decimalOf("\"113.0\"").compareTo(esperado));
        assertEquals(0, decimalOf("113.00").compareTo(esperado));
        assertEquals(0, decimalOf("113").compareTo(esperado));
    }

    @Test
    void unMontoDistintoSigueSinCoincidir() throws Exception {
        BigDecimal esperado = new BigDecimal("113.00");
        assertNotEquals(0, decimalOf("\"999.00\"").compareTo(esperado));
        assertNotEquals(0, decimalOf("113.01").compareTo(esperado));
    }

    @Test
    void unMontoIlegibleDevuelveNuloEnLugarDeRomper() throws Exception {
        assertNull(decimalOf("\"no-es-un-numero\""));
        assertNull(decimalOf("null"));
        assertNull(decimalOf("{}"));
    }

    @Test
    void laProduccionSeLeeSeaBooleanoTextoONumero() throws Exception {
        assertEquals(Boolean.FALSE, boolOf("false"));
        assertEquals(Boolean.TRUE, boolOf("true"));
        assertEquals(Boolean.TRUE, boolOf("\"true\""));
        assertEquals(Boolean.FALSE, boolOf("\"false\""));
        assertEquals(Boolean.TRUE, boolOf("1"));
        assertEquals(Boolean.FALSE, boolOf("0"));
        assertNull(boolOf("\"quiza\""));
    }

    @Test
    void laNotificacionRealDeWompiSeInterpretaCompleta() throws Exception {
        // Es la forma del webhook que ld Continuous
        String payload = """
                {
                  "EnlacePago": {
                    "Id": 4525126,
                    "IdentificadorEnlaceComercio": "ELITEDRIVER-9823d659-4071-45a7-baee-bf1b5b1b7169"
                  },
                  "Aplicativo": { "Id": "364c3f27-e36f-4bcd-9601-5ffecc9ed311" },
                  "Monto": "113.00",
                  "EsProductiva": "false",
                  "IdTransaccion": "166d58ea-3aa1-4b1d-9fba-1053d29023b3",
                  "ResultadoTransaccion": "ExitosaAprobada"
                }""".replace("ld Continuous", "").replace("Es la forma del webhook que ", "");
        JsonNode event = mapper.readTree(payload);
        JsonNode enlace = event.get("EnlacePago");
        assertEquals(4525126L, enlace.get("Id").asLong());
        assertEquals(0, decimalOf(event.get("Monto").asText()).compareTo(new BigDecimal("113.00")));
        assertEquals(Boolean.FALSE, boolOf(event.get("EsProductiva").asText()));
        assertFalse(event.get("IdTransaccion").asText().isBlank());
    }
}