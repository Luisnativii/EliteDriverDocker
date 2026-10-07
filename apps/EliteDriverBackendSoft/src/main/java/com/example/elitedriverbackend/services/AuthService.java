package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.domain.dtos.AuthRequest;
import com.example.elitedriverbackend.domain.dtos.AuthResponse;
import com.example.elitedriverbackend.domain.dtos.RegisterRequest;
import com.example.elitedriverbackend.domain.dtos.UserResponse;
import com.example.elitedriverbackend.domain.entity.User;
import com.example.elitedriverbackend.repositories.UserRepository;
import com.example.elitedriverbackend.security.JwtService;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/*
    Servicio para manejar la autenticación y registro de usuarios.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    /*
        Registra un nuevo usuario en el sistema.
     */
    public String register(RegisterRequest request) {
        // Verificar confirmación de contraseña (antes se ignoraba)
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Las contraseñas no coinciden");
        }
        // Fortaleza mínima: backend no confiaba en frontend (solo pedía 6)
        if (request.getPassword().length() < 10
                || !request.getPassword().matches(".*[A-Za-z].*")
                || !request.getPassword().matches(".*\\d.*")) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 10 caracteres, una letra y un número");
        }
        // Normalizar email para evitar duplicados por mayúsculas/espacios
        String email = request.getEmail().trim().toLowerCase();
        // Verificar si el usuario ya existe
        if (userRepository.findByEmail(email).isPresent()) {
            throw new EntityExistsException("El email ya está registrado");
        }
        if (userRepository.existsByDui(request.getDui())) {
            throw new EntityExistsException("El DUI ya está registrado");
        }
        // Validar fecha real y edad mínima 18 años (regla de negocio)
        LocalDate birth;
        try {
            birth = LocalDate.parse(request.getBirthDate());
        } catch (Exception e) {
            throw new IllegalArgumentException("Fecha de nacimiento inválida");
        }
        if (birth.isAfter(LocalDate.now().minusYears(18))) {
            throw new IllegalArgumentException("Debes tener al menos 18 años para registrarte");
        }

        // Crear nuevo usuario
        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .birthDate(request.getBirthDate())
                .dui(request.getDui())
                .phoneNumber(request.getPhoneNumber())
                .role("CUSTOMER") // Por defecto
                .build();

        userRepository.save(user);
        return "Usuario registrado exitosamente";
    }

    /*
        Autentica a un usuario y genera un token JWT.
        Si las credenciales son inválidas, lanza una excepción.
     */
    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

        // Buscar usuario por email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    return new EntityNotFoundException("Credenciales inválidas");
                });

        // Verificar contraseña usando AuthenticationManager
        try {
            var auth = new UsernamePasswordAuthenticationToken(
                    email, request.getPassword()
            );
            authManager.authenticate(auth);
        } catch (Exception e) {
            throw new EntityNotFoundException("Credenciales inválidas");
        }

        // Generar token JWT
        String token = jwtService.generateToken(user.getEmail());

        // Crear respuesta: birthDate puede venir nulo/malformado en datos viejos o futuros logins Google
        LocalDate birth = null;
        try {
            if (user.getBirthDate() != null && !user.getBirthDate().isBlank()) {
                birth = LocalDate.parse(user.getBirthDate());
            }
        } catch (Exception ignored) {
            birth = null;
        }

        // Crear respuesta con UUID convertido a String si es necesario
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .phoneNumber(user.getPhoneNumber())
                .dui(user.getDui())
                .birthDate(birth)
                .build();

        return AuthResponse.builder()
                .token(token)
                .user(userResponse)
                .message("Login exitoso")
                .build();
    }

    /*
        Valida un token JWT.
     */
    public boolean validateToken(String token) {
        try {
            return jwtService.isTokenValid(token);
        } catch (Exception e) {
            log.error("Error validando token: {}", e.getMessage());
            return false;
        }
    }
}