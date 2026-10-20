package com.example.elitedriverbackend.controller;

import com.example.elitedriverbackend.domain.dtos.SupplierDTO;
import com.example.elitedriverbackend.services.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/admin/suppliers") @RequiredArgsConstructor
public class AdminSupplierController {
    private final SupplierService suppliers;
    @GetMapping public List<SupplierDTO> list() { return suppliers.list(); }
    @PostMapping public ResponseEntity<SupplierDTO> create(@Valid @RequestBody SupplierDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(suppliers.save(null,dto));
    }
    @PutMapping("/{id}") public SupplierDTO update(@PathVariable UUID id,@Valid @RequestBody SupplierDTO dto) { return suppliers.save(id,dto); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable UUID id) { suppliers.delete(id);return ResponseEntity.noContent().build(); }
}
