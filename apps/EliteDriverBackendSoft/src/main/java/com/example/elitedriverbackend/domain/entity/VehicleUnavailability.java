package com.example.elitedriverbackend.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "vehicle_unavailability", indexes = @Index(name = "idx_vehicle_unavailability_dates", columnList = "vehicle_id,start_date,end_date"))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class VehicleUnavailability {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    @Column(length = 250)
    private String reason;
}
