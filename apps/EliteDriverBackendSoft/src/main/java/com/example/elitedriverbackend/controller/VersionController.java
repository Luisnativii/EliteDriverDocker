package com.example.elitedriverbackend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Expone la versión del build desplegada.
 * El panel de administración la compara con la del frontend para detectar
 * imágenes desactualizadas sin tener que entrar por SSH.
 *
 * Queda bajo `anyRequest().authenticated()`, como el resto de la API:
 * solo un usuario con sesión puede leerla.
 */
@RestController
public class VersionController {

    private final String version;

    public VersionController(@Value("${app.version:desconocida}") String version) {
        this.version = version;
    }

    @GetMapping("/api/version")
    public Map<String, String> version() {
        return Map.of("version", version);
    }
}