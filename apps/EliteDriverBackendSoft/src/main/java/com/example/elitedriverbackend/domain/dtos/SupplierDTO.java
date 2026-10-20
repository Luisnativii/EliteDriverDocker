package com.example.elitedriverbackend.domain.dtos;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SupplierDTO {
    private UUID id;
    @NotBlank @Size(max = 120) private String name;
    @Size(max = 40) private String phone;
    @Email @Size(max = 150) private String email;
    @Size(max = 500) private String notes;
    private Instant createdAt;
    private long vehicleCount;
}
