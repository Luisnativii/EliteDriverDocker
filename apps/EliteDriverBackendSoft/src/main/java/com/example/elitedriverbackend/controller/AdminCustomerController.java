package com.example.elitedriverbackend.controller;

import com.example.elitedriverbackend.domain.dtos.AdminCustomerDTO.*;
import com.example.elitedriverbackend.services.AdminCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController @RequestMapping("/api/admin/customers") @RequiredArgsConstructor
public class AdminCustomerController {
    private final AdminCustomerService customers;
    @GetMapping public CustomersPage list(@RequestParam(required=false) String month,@RequestParam(defaultValue="") String search,
        @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="25") int size) { return customers.list(month,search,page,size); }
    @GetMapping("/{id}/reservations") public HistoryPage history(@PathVariable UUID id,@RequestParam(required=false) String month,
        @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size) { return customers.history(id,month,page,size); }
}
