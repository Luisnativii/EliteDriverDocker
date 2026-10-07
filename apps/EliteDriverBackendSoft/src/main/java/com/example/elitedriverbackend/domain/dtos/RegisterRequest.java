package com.example.elitedriverbackend.domain.dtos;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Size(min = 2, max = 50)
    private String firstName;

    @NotBlank
    @Size(min = 2, max = 50)
    private String lastName;

    @NotBlank
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "birthDate debe tener formato YYYY-MM-DD")
    private String birthDate;

    @NotBlank
    @Pattern(regexp = "^\\d{8}-\\d$", message = "DUI debe tener formato 00000000-0")
    private String dui;

    @NotBlank
    @Pattern(regexp = "^\\d{4}-\\d{4}$", message = "Teléfono debe tener formato 0000-0000")
    private String phoneNumber;

    @Email
    @NotBlank
    @Size(max = 150)
    private String email;

    @NotBlank
    @Size(min = 10, max = 100, message = "La contraseña debe tener entre 10 y 100 caracteres")
    private String password;

    @NotBlank
    private String confirmPassword;
}