package com.example.elitedriverbackend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "wompi")
public class WompiProperties {
    private boolean enabled;
    private boolean allowProduction;
    private String appId = "";
    private String apiSecret = "";
    private String apiUrl = "https://api.wompi.sv";
    private String tokenUrl = "https://id.wompi.sv/connect/token";
    private String redirectUrl = "";
    private String webhookUrl = "";
    private String notificationEmails = "";
}
