package com.example.elitedriverbackend.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Date;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "reservations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_reservations_wompi_link", columnNames = "wompi_link_id"),
        @UniqueConstraint(name = "uk_reservations_payment_transaction", columnNames = "payment_transaction_id")
})
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Date startDate;

    @Column(nullable = false)
    private Date endDate;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @JsonIgnore
    private Long wompiLinkId;

    @JsonIgnore
    private String wompiApplicationId;

    @Column(length = 2000)
    @JsonIgnore
    private String paymentUrl;

    @Column(length = 2000)
    @JsonIgnore
    private String qrCodeUrl;

    private Boolean paymentProduction;

    @JsonIgnore
    private String paymentTransactionId;

    private Instant paidAt;

    @ManyToOne
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne
    @JoinColumn(
            name = "car_id",
            nullable = false
    )
    private Vehicle vehicle;
}
