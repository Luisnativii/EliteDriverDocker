package com.example.elitedriverbackend.security;

import com.example.elitedriverbackend.domain.entity.User;
import com.example.elitedriverbackend.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * Una cuenta sin contraseña (futuro ingreso con Google) debe poder construir su
 * UserDetails sin reventar, porque JwtAuthenticationFilter lo pide en cada request.
 * Antes fallaba aquí con IllegalArgumentException de Spring.
 */
@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    UserRepository userRepository;

    @InjectMocks
    CustomUserDetailsService service;

    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    private User userWithPassword(String password) {
        return User.builder()
                .email("persona@example.com")
                .password(password)
                .role("CUSTOMER")
                .build();
    }

    @Test
    void unaCuentaSinPasswordNoRompeAlCargarSusDatos() {
        when(userRepository.findByEmail("persona@example.com"))
                .thenReturn(Optional.of(userWithPassword(null)));

        UserDetails details = assertDoesNotThrow(
                () -> service.loadUserByUsername("persona@example.com"));

        assertEquals("persona@example.com", details.getUsername());
        assertNotNull(details.getPassword(), "Spring exige una contraseña no nula");
        assertTrue(details.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER")));
    }

    @Test
    void unaCuentaSinPasswordNoPuedeEntrarConContrasena() {
        when(userRepository.findByEmail("persona@example.com"))
                .thenReturn(Optional.of(userWithPassword(null)));
        UserDetails details = service.loadUserByUsername("persona@example.com");

        // Debe responder false, no lanzar: el valor debe ser un hash BCrypt válido.
        assertFalse(encoder.matches("cualquiera", details.getPassword()));
        assertFalse(encoder.matches("", details.getPassword()));
        assertFalse(encoder.matches("123456789", details.getPassword()));
    }

    @Test
    void unaCuentaSinPasswordYBlancoTambienSeResuelve() {
        when(userRepository.findByEmail("persona@example.com"))
                .thenReturn(Optional.of(userWithPassword("   ")));

        UserDetails details = assertDoesNotThrow(
                () -> service.loadUserByUsername("persona@example.com"));
        assertFalse(encoder.matches("cualquiera", details.getPassword()));
    }

    @Test
    void unaCuentaConPasswordConservaSuHash() {
        String real = encoder.encode("ClaveConSimbolo#1");
        when(userRepository.findByEmail("persona@example.com"))
                .thenReturn(Optional.of(userWithPassword(real)));

        UserDetails details = service.loadUserByUsername("persona@example.com");

        assertEquals(real, details.getPassword(), "no debe tocar las cuentas que ya funcionan");
        assertTrue(encoder.matches("ClaveConSimbolo#1", details.getPassword()));
        assertFalse(encoder.matches("otra", details.getPassword()));
    }

    @Test
    void unEmailInexistenteSigueDandoCredencialesInvalidas() {
        when(userRepository.findByEmail("nadie@example.com")).thenReturn(Optional.empty());

        UsernameNotFoundException ex = assertThrows(UsernameNotFoundException.class,
                () -> service.loadUserByUsername("nadie@example.com"));
        assertEquals("Credenciales inválidas", ex.getMessage(),
                "mensaje genérico para no enumerar cuentas");
    }
}