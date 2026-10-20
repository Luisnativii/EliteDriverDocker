package com.example.elitedriverbackend.domain.dtos;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;

public final class AdminCustomerDTO {
    private AdminCustomerDTO() {}
    public record Hold(UUID reservationId,String vehicleName,Instant expiresAt) {}
    public record Customer(UUID id,String firstName,String lastName,String email,String phoneNumber,String dui,
                           Instant createdAt,Instant lastLoginAt,int activeCount,int rentalsInMonth,List<Hold> pendingHolds) {}
    public record Stats(long totalCustomers,long newCustomers,long customersWithRentals,long rentals,
                        long activeCustomers,long pendingCustomers,long unknownCreationDates) {}
    public record CustomersPage(List<Customer> items,long total,int page,int size,String month,Stats stats,Instant serverNow) {}
    public record Rental(UUID id,UUID vehicleId,String vehicleName,LocalDate startDate,LocalDate endDate,
                         BigDecimal totalPrice,String paymentStatus,Instant holdExpiresAt,Instant paidAt) {}
    public record HistoryPage(Customer customer,List<Rental> items,long total,int page,int size,Instant serverNow) {}
}
