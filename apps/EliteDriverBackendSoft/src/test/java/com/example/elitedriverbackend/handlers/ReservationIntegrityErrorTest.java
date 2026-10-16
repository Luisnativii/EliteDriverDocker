package com.example.elitedriverbackend.handlers;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import java.sql.SQLException;
import static org.junit.jupiter.api.Assertions.*;

class ReservationIntegrityErrorTest {
    @Test
    void exclusionConflictIsAClientErrorWithoutDatabaseDetails() {
        var exception = new DataIntegrityViolationException("private SQL and row values",
                new SQLException("private conflict detail", "23P01"));
        var response = new GlobalExceptionHandler().handleIntegrityViolation(exception);
        assertEquals(400, response.getStatusCode().value());
        assertTrue(response.getBody().get("error").toString().contains("ya está reservado"));
        assertFalse(response.getBody().toString().contains("private"));
    }

    @Test
    void otherIntegrityErrorsDoNotExposeSql() {
        var response = new GlobalExceptionHandler().handleIntegrityViolation(
                new DataIntegrityViolationException("private unique row", new SQLException("secret", "23505")));
        assertEquals(400, response.getStatusCode().value());
        assertFalse(response.getBody().toString().contains("private"));
        assertFalse(response.getBody().toString().contains("secret"));
    }
}
