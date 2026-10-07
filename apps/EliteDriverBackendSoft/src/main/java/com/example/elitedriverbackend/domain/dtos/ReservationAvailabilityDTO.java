package com.example.elitedriverbackend.domain.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Vista pública de ocupación: sin PII.
 * La página pública de vehículos debe usar esto, nunca ReservationResponseDTO.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReservationAvailabilityDTO {
    private String vehicleId;
    private Date startDate;
    private Date endDate;
    private String status;
}
