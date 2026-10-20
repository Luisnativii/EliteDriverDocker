package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.domain.dtos.*;
import com.example.elitedriverbackend.domain.entity.User;
import com.example.elitedriverbackend.repositories.UserRepository;
import com.example.elitedriverbackend.security.JwtService;
import org.junit.jupiter.api.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthActivityTest {
    final UserRepository users=mock(UserRepository.class);
    final PasswordEncoder encoder=mock(PasswordEncoder.class);
    final JwtService jwt=mock(JwtService.class);
    final AuthenticationManager auth=mock(AuthenticationManager.class);
    final Instant now=Instant.parse("2026-10-20T18:00:00Z");
    final AuthService service=new AuthService(users,encoder,jwt,auth,Clock.fixed(now,ZoneId.of("America/El_Salvador")));
    @Test void recordsCreationAndFirstSessionAtRegistration() {
        RegisterRequest request=new RegisterRequest();request.setFirstName("Cliente");request.setLastName("Prueba");request.setEmail("new@example.invalid");
        request.setPassword("test!");request.setConfirmPassword("test!");request.setBirthDate("1990-01-01");request.setDui("12345678-9");request.setPhoneNumber("7000-0000");
        when(users.save(any())).thenAnswer(i->{User u=i.getArgument(0);u.setId(UUID.randomUUID());return u;});
        service.register(request);
        var captor=org.mockito.ArgumentCaptor.forClass(User.class);verify(users).save(captor.capture());
        assertEquals(now,captor.getValue().getCreatedAt());assertEquals(now,captor.getValue().getLastLoginAt());
    }
    @Test void successfulLoginRecordsAccessWithoutInventingOldCreationDate() {
        User user=User.builder().id(UUID.randomUUID()).email("old@example.invalid").role("CUSTOMER").build();
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        AuthRequest request=new AuthRequest();request.setEmail(user.getEmail());request.setPassword("existing");
        service.login(request);assertEquals(now,user.getLastLoginAt());assertNull(user.getCreatedAt());verify(users).save(user);
    }
    @Test void failedLoginDoesNotChangeAccessOrCreation() {
        User user=User.builder().id(UUID.randomUUID()).email("old@example.invalid").role("CUSTOMER").build();
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));when(auth.authenticate(any())).thenThrow(new RuntimeException("Bad credentials"));
        AuthRequest request=new AuthRequest();request.setEmail(user.getEmail());request.setPassword("wrong");
        assertThrows(Exception.class,()->service.login(request));assertNull(user.getLastLoginAt());verify(users,never()).save(any());
    }
}
