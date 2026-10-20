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
    private final java.time.Clock rentalClock;

    /*
        Registra un nuevo usuario en el sistema.
     */
    public AuthResponse register(RegisterRequest request) {
        // Verificar confirmación de contraseña (antes se ignoraba)
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Las contraseñas no coinciden");
        }
        // Regla vigente: 5 caracteres mínimo y al menos un símbolo.
        // El backend no confía en el frontend, así que repite la validación aquí.
        // Solo aplica a cuentas nuevas: el login no evalúa esta regla, de modo que
        // las contraseñas ya creadas con la regla anterior siguen entrando sin cambios.
        if (request.getPassword().length() < 5
                || !request.getPassword().matches(".*[^A-Za-z0-9\\s].*")) {
            throw new IllegalArgumentException(
                    "La contraseña debe tener al menos 5 caracteres y un símbolo");
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
                .createdAt(java.time.Instant.now(rentalClock))
                .lastLoginAt(java.time.Instant.now(rentalClock))
                .role("CUSTOMER") // Por defecto
                .build();

        userRepository.save(user);
        // Se devuelve la misma respuesta que el login para que la persona quede
        // con sesión iniciada sin tener que escribir su contraseña otra vez.
        return AuthResponse.builder()
                .token(jwtService.generateToken(user.getEmail()))
                .user(toResponse(user))
                .message("Usuario registrado exitosamente")
                .build();
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

        user.setLastLoginAt(java.time.Instant.now(rentalClock));
        userRepository.save(user);

        // Generar token JWT
        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(toResponse(user))
                .message("Login exitoso")
                .build();
    }

    /*
        Construye el perfil que ve el cliente. El password nunca se incluye.
        birthDate puede venir nulo o malformado en datos viejos o futuros logins Google.
     */
    private UserResponse toResponse(User user) {
        LocalDate birth = null;
        try {
            if (user.getBirthDate() != null && !user.getBirthDate().isBlank()) {
                birth = LocalDate.parse(user.getBirthDate());
            }
        } catch (Exception ignored) {
            birth = null;
        }

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .phoneNumber(user.getPhoneNumber())
                .dui(user.getDui())
                .birthDate(birth)
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