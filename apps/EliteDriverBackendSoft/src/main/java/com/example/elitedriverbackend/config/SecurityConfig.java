package com.example.elitedriverbackend.config;

import com.example.elitedriverbackend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/*
    Configuración de seguridad para la aplicación Elite Driver Backend.
    Define las reglas de autorización y autenticación, incluyendo el manejo de CORS y la integración del filtro JWT.
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    /*
        Configura la cadena de filtros de seguridad HTTP.
        Define las políticas de CORS, CSRF, gestión de sesiones y reglas de autorización para diferentes endpoints.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Endpoints públicos
                        .requestMatchers("/health").permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/payments/wompi/webhook").permitAll()
                        // Catálogo público + disponibilidad sin PII (nuevo endpoint)
                        .requestMatchers(HttpMethod.GET, "/api/vehicles", "/api/vehicles/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reservations/availability").permitAll()
                        // Validación de token
                        .requestMatchers("/api/auth/validate").authenticated()
                        // Operaciones de administración sobre vehículos
                        .requestMatchers(HttpMethod.POST,   "/api/vehicles").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/vehicles/**").hasRole("ADMIN")
                        // Listado global de reservas solo ADMIN (antes era público y filtraba DUI)
                        .requestMatchers(HttpMethod.GET, "/api/reservations").hasRole("ADMIN")
                        // Cualquier otra petición requiere autenticación
                        // (GET /api/reservations/{id}, /date, /user, /vehicle, /vehicleType ahora exigen JWT
                        // + chequeo dueño/ADMIN en el controlador)
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /*
        Configura la fuente de configuración CORS para permitir solicitudes desde el frontend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // No usar "*" con allowCredentials=true: el navegador lo rechaza y amplía superficie XSS
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "wompi_hash"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /*
        Define el codificador de contraseñas utilizando BCrypt.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /*
        Proporciona el gestor de autenticación basado en la configuración de autenticación existente.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}
