package com.example.elitedriverbackend.config;

import com.example.elitedriverbackend.domain.entity.User;
import com.example.elitedriverbackend.repositories.UserRepository;
import com.example.elitedriverbackend.repositories.VehicleTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {
    @Mock UserRepository users;
    @Mock VehicleTypeRepository types;
    @Mock PasswordEncoder encoder;
    private DataInitializer initializer;

    @BeforeEach
    void setUp() {
        initializer = new DataInitializer(users, types, encoder);
    }

    private void configure(String email, String password) {
        ReflectionTestUtils.setField(initializer, "bootstrapAdminEmail", email);
        ReflectionTestUtils.setField(initializer, "bootstrapAdminPassword", password);
    }

    @Test
    void disabledBootstrapDoesNotCreateOrChangeUsers() throws Exception {
        configure("", "");
        initializer.initData().run();
        verifyNoInteractions(users, encoder);
    }

    @Test
    void existingAdministratorIsNeverOverwritten() throws Exception {
        configure("owner@example.com", "new-configuration-value");
        when(users.findByEmail("owner@example.com")).thenReturn(Optional.of(new User()));
        initializer.initData().run();
        verify(users, never()).save(any());
        verifyNoInteractions(encoder);
    }

    @Test
    void missingPasswordDoesNotCreateAdministrator() throws Exception {
        configure("owner@example.com", "");
        when(users.findByEmail("owner@example.com")).thenReturn(Optional.empty());
        initializer.initData().run();
        verify(users, never()).save(any());
        verifyNoInteractions(encoder);
    }

    @Test
    void explicitBootstrapUsesConfiguredPasswordEncoder() throws Exception {
        configure("owner@example.com", "test-only-value");
        when(users.findByEmail("owner@example.com")).thenReturn(Optional.empty());
        when(encoder.encode("test-only-value")).thenReturn("encoded-test-value");
        initializer.initData().run();
        ArgumentCaptor<User> captured = ArgumentCaptor.forClass(User.class);
        verify(users).save(captured.capture());
        assertEquals("owner@example.com", captured.getValue().getEmail());
        assertEquals("encoded-test-value", captured.getValue().getPassword());
        assertEquals("ADMIN", captured.getValue().getRole());
    }
}
