package com.example.elitedriverbackend.security;

import com.example.elitedriverbackend.domain.entity.User;
import com.example.elitedriverbackend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/*
    CustomUserDetailsService is responsible for loading user-specific data during authentication.
    It implements the UserDetailsService interface provided by Spring Security.
    The loadUserByUsername method retrieves a User entity from the database using the provided email.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    /*
        Hash BCrypt válido de una cadena aleatoria de 48 caracteres que nunca se
        guardó ni se comunica a nadie. Existe solo para que una cuenta sin
        contraseña (por ejemplo, un futuro ingreso con Google) pueda construir su
        UserDetails sin fallar: Spring exige una contraseña no nula, y
        JwtAuthenticationFilter pide este servicio en cada request autenticado.

        Al ser la preimagen desconocida, PasswordEncoder.matches() siempre
        devuelve false ante cualquier contraseña: esa cuenta no puede entrar con
        contraseña, solo por su proveedor externo. Usar un valor constante en
        vez de generar un hash por request evita pagar el costo de BCrypt en
        cada petición.
    */
    private static final String PASSWORD_NO_UTILIZABLE =
            "$2a$10$hpzWXMRbXoEK3P4PkSdmGO6U.egV6e5M4M5xROSWcH/6WL4Xt4IRu";

    private final UserRepository userRepository;

    /*
        Loads the user by email and constructs a UserDetails object for authentication.
        @param email The email of the user to be loaded.
        @return UserDetails object containing user information and authorities.
        @throws UsernameNotFoundException if the user with the given email is not found.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Credenciales inválidas"));

        String password = user.getPassword();
        if (password == null || password.isBlank()) {
            password = PASSWORD_NO_UTILIZABLE;
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(password)
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole())))
                .build();
    }
}