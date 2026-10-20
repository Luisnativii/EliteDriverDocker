package com.example.elitedriverbackend.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "suppliers")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Supplier {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, length = 120) private String name;
    @Column(length = 40) private String phone;
    @Column(length = 150) private String email;
    @Column(length = 500) private String notes;
    @Column(nullable = false, updatable = false) private Instant createdAt;
    @PrePersist void created() { if (createdAt == null) createdAt = Instant.now(); }
}
