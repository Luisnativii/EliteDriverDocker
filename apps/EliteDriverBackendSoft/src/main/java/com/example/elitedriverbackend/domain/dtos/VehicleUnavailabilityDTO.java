package com.example.elitedriverbackend.domain.dtos;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class VehicleUnavailabilityDTO {
    private UUID id;
    @NotNull private LocalDate startDate;
    @NotNull private LocalDate endDate;
    @Size(max = 250) private String reason;
}
