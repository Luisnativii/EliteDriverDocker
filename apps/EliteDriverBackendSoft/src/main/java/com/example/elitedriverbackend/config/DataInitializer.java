package com.example.elitedriverbackend.config;

import com.example.elitedriverbackend.domain.entity.VehicleType;
import com.example.elitedriverbackend.domain.entity.User;
import com.example.elitedriverbackend.repositories.VehicleTypeRepository;
import com.example.elitedriverbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

/*
    Clase de configuración para inicializar datos en la base de datos al iniciar la aplicación.
    - Crea un usuario ADMIN si no existe.
    - Si no existen, crea tipos de vehículo: PickUp, Sedan, SUV, Microbus.
 */
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final VehicleTypeRepository vehicleTypeRepository; // ← inyectado
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.email:}")
    private String bootstrapAdminEmail;

    @Value("${app.bootstrap-admin.password:}")
    private String bootstrapAdminPassword;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // La creación inicial es opcional y nunca modifica cuentas existentes.
            if (bootstrapAdminEmail != null && !bootstrapAdminEmail.isBlank()) {
                userRepository.findByEmail(bootstrapAdminEmail).ifPresentOrElse(u -> {
                    System.out.println("✅ Admin ya existe");
                }, () -> {
                    if (bootstrapAdminPassword == null || bootstrapAdminPassword.isBlank()) {
                        System.out.println("Creación inicial de administrador omitida: falta contraseña configurada");
                        return;
                    }
                    User admin = User.builder()
                            .firstName("Admin")
                            .lastName("Root")
                            .birthDate("1990-01-01")
                            .dui("00000000-0")
                            .phoneNumber("7000-0000")
                            .email(bootstrapAdminEmail)
                            .password(passwordEncoder.encode(bootstrapAdminPassword))
                            .role("ADMIN")
                            .build();
                    userRepository.save(admin);
                    System.out.println("✅ Admin creado");
                });
            }

            // 2) Sembrar VehicleType: PickUp, Sedan, SUV, Microbus

            // Verificamos si ya existen los tipos de vehículo
            List<String> tipos = List.of("PickUp", "Sedan", "SUV", "Microbus");
            tipos.forEach(tipoNombre ->
                    vehicleTypeRepository.findByType(tipoNombre).ifPresentOrElse(vt -> {
                        System.out.println("✅ VehicleType '" + tipoNombre + "' ya existe");
                    }, () -> {
                        VehicleType nuevo = VehicleType.builder()
                                .type(tipoNombre)
                                .build();
                        vehicleTypeRepository.save(nuevo);
                        System.out.println("✅ VehicleType '" + tipoNombre + "' creado");
                    })
            );
        };
    }
}
