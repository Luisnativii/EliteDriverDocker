package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.config.WompiProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class WompiClientTest {
    private final WompiProperties properties = new WompiProperties();
    private MockRestServiceServer server;
    private WompiClient client;

    @BeforeEach
    void setup() {
        properties.setEnabled(true);
        properties.setAppId("test-app");
        properties.setApiSecret("test-secret");
        var builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        client = new WompiClient(properties, builder.build());
    }

    private void expectToken() {
        server.expect(requestTo("https://id.wompi.sv/connect/token")).andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("audience=wompi_api")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("grant_type=client_credentials")))
                .andRespond(withSuccess("{\"access_token\":\"mock-token\",\"expires_in\":3600}", MediaType.APPLICATION_JSON));
    }

    @Test
    void authenticatesAndCachesToken() {
        expectToken();
        for (int i = 0; i < 2; i++) server.expect(requestTo("https://api.wompi.sv/Aplicativo"))
                .andExpect(header("Authorization", "Bearer mock-token"))
                .andRespond(withSuccess("{\"estaProductivo\":false,\"idAplicativo\":\"test-app\"}", MediaType.APPLICATION_JSON));
        assertThat(client.checkEnvironment().production()).isFalse();
        assertThat(client.checkEnvironment().production()).isFalse();
        server.verify();
    }

    @Test
    void blocksProductionUnlessExplicitlyEnabled() {
        expectToken();
        server.expect(requestTo("https://api.wompi.sv/Aplicativo"))
                .andRespond(withSuccess("{\"estaProductivo\":true,\"idAplicativo\":\"test-app\"}", MediaType.APPLICATION_JSON));
        assertThatThrownBy(client::checkEnvironment).isInstanceOfSatisfying(ResponseStatusException.class,
                ex -> assertThat(ex.getStatusCode().value()).isEqualTo(409));
        server.verify();
    }

    @Test
    void hidesProviderResponseAndPreservesGatewayStatus() {
        expectToken();
        server.expect(requestTo("https://api.wompi.sv/Aplicativo")).andRespond(withStatus(HttpStatus.BAD_REQUEST)
                .body("sensitive-provider-response").contentType(MediaType.TEXT_PLAIN));
        assertThatThrownBy(client::checkEnvironment).isInstanceOfSatisfying(ResponseStatusException.class, ex -> {
            assertThat(ex.getStatusCode().value()).isEqualTo(502);
            assertThat(ex.getReason()).doesNotContain("sensitive-provider-response");
        });
        server.verify();
    }
}
