package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.config.WompiProperties;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;

@Component
public class WompiClient {
    private final WompiProperties properties;
    private final RestClient client;
    private String accessToken;
    private Instant expiresAt = Instant.EPOCH;

    public WompiClient(WompiProperties properties, @Qualifier("wompiRestClient") RestClient client) {
        this.properties = properties;
        this.client = client;
    }

    public void checkConfiguration() {
        if (!properties.isEnabled() || properties.getAppId().isBlank() || properties.getApiSecret().isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Los pagos con Wompi aún no están configurados en el servidor.");
        }
    }

    private synchronized String token() {
        checkConfiguration();
        if (accessToken != null && Instant.now().isBefore(expiresAt)) return accessToken;
        var form = new LinkedMultiValueMap<String, String>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", properties.getAppId());
        form.add("client_secret", properties.getApiSecret());
        form.add("audience", "wompi_api");
        try {
            JsonNode response = client.post().uri(properties.getTokenUrl())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form)
                    .retrieve().body(JsonNode.class);
            if (response == null || response.path("access_token").asText().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Wompi no devolvió un token válido.");
            }
            accessToken = response.path("access_token").asText();
            expiresAt = Instant.now().plusSeconds(Math.max(0, response.path("expires_in").asLong(60) - 30));
            return accessToken;
        } catch (RestClientException ex) {
            throw providerError(ex);
        }
    }

    public record Environment(String applicationId, boolean production) {}

    public Environment checkEnvironment() {
        JsonNode app = get("/Aplicativo");
        if (!app.path("estaProductivo").isBoolean()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No se pudo verificar el modo de Wompi.");
        }
        boolean production = app.path("estaProductivo").asBoolean();
        if (production && !properties.isAllowProduction()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El negocio de Wompi está en producción. Cámbialo a desarrollo para realizar pruebas.");
        }
        String applicationId = app.path("idAplicativo").asText();
        if (applicationId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Wompi no devolvió el identificador del negocio.");
        }
        return new Environment(applicationId, production);
    }

    public JsonNode createLink(Map<String, Object> body) {
        try {
            return client.post().uri(properties.getApiUrl() + "/EnlacePago")
                    .headers(h -> h.setBearerAuth(token())).contentType(MediaType.APPLICATION_JSON)
                    .body(body).retrieve().body(JsonNode.class);
        } catch (RestClientException ex) {
            throw providerError(ex);
        }
    }

    public void deactivateLink(Long id) {
        try {
            client.put().uri(properties.getApiUrl() + "/EnlacePago/" + id + "/desactivar")
                    .headers(h -> h.setBearerAuth(token())).retrieve().toBodilessEntity();
        } catch (RestClientException ex) {
            throw providerError(ex);
        }
    }

    public JsonNode getLink(Long id) {
        return get("/EnlacePago/" + id);
    }

    private JsonNode get(String path) {
        try {
            JsonNode response = client.get().uri(properties.getApiUrl() + path)
                    .headers(h -> h.setBearerAuth(token())).retrieve().body(JsonNode.class);
            if (response == null) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Respuesta vacía de Wompi.");
            return response;
        } catch (RestClientException ex) {
            throw providerError(ex);
        }
    }

    private ResponseStatusException providerError(RestClientException ex) {
        if (ex instanceof RestClientResponseException response && response.getStatusCode().value() == 401) {
            synchronized (this) { accessToken = null; }
            return new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Wompi rechazó las credenciales. Revisa el App ID y API Secret del servidor.");
        }
        // No incluir respuestas del proveedor: pueden contener datos sensibles.
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "No se pudo completar la solicitud con Wompi. Tu reserva sigue guardada; revisa Mis reservas.");
    }
}
