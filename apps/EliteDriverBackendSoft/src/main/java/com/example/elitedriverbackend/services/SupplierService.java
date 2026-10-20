package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.domain.entity.Supplier;
import com.example.elitedriverbackend.domain.dtos.SupplierDTO;
import com.example.elitedriverbackend.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@Service @RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepository suppliers;
    private final VehicleRepository vehicles;

    @Transactional(readOnly = true)
    public List<SupplierDTO> list() {
        Map<UUID,Long> counts = new HashMap<>();
        vehicles.countBySupplier().forEach(row -> counts.put((UUID)row[0], ((Number)row[1]).longValue()));
        return suppliers.findAllByOrderByNameAsc().stream().map(s -> dto(s, counts.getOrDefault(s.getId(), 0L))).toList();
    }
    @Transactional
    public SupplierDTO save(UUID id, SupplierDTO request) {
        Supplier supplier = id == null ? new Supplier() : require(id);
        if (request.getName() == null || request.getName().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El nombre es requerido.");
        supplier.setName(request.getName().trim());supplier.setPhone(clean(request.getPhone()));
        supplier.setEmail(clean(request.getEmail()));supplier.setNotes(clean(request.getNotes()));
        return dto(suppliers.saveAndFlush(supplier), id == null ? 0 : vehicles.countBySupplier_Id(id));
    }
    @Transactional
    public void delete(UUID id) {
        Supplier supplier = require(id);
        if (vehicles.countBySupplier_Id(id) > 0) throw new ResponseStatusException(HttpStatus.CONFLICT,"Este proveedor tiene vehículos asignados. Reasígnalos antes de eliminarlo.");
        suppliers.delete(supplier);
    }
    public Supplier require(UUID id) {
        return suppliers.findLocked(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Proveedor no encontrado."));
    }
    private static String clean(String s) { return s == null || s.isBlank() ? null : s.trim(); }
    public static SupplierDTO dto(Supplier s, long count) {
        return SupplierDTO.builder().id(s.getId()).name(s.getName()).phone(s.getPhone()).email(s.getEmail())
                .notes(s.getNotes()).createdAt(s.getCreatedAt()).vehicleCount(count).build();
    }
}
