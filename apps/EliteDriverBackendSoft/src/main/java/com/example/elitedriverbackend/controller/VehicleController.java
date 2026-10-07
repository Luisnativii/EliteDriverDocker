package com.example.elitedriverbackend.controller;

import com.example.elitedriverbackend.domain.dtos.CreateVehicleDTO;
import com.example.elitedriverbackend.domain.dtos.UpdateVehicleDTO;
import com.example.elitedriverbackend.domain.dtos.VehicleResponseDTO;
import com.example.elitedriverbackend.services.VehicleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/*
    Controlador REST para gestionar vehículos.
    Catálogo: Sedan, SUV, PickUp (sin Microbus por decisión de negocio).
 */
@RestController
@RequestMapping("/api/vehicles")      // ← Aquí el prefijo /api
@Slf4j
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    /*
        Endpoint para agregar un nuevo vehículo.
        Recibe un objeto CreateVehicleDTO en el cuerpo de la solicitud.
     */
    @PostMapping
    public ResponseEntity<Void> addVehicle(@RequestBody CreateVehicleDTO dto) {
        vehicleService.addVehicle(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /*
        Endpoint para actualizar un vehículo existente.
        Recibe el ID del vehículo en la URL y un objeto UpdateVehicleDTO en el cuerpo de la solicitud.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateVehicle(
            @PathVariable String id,
            @RequestBody UpdateVehicleDTO dto) {

        vehicleService.updateVehicle(dto, UUID.fromString(id));
        return ResponseEntity.ok().build();
    }

    /*
        Endpoint para eliminar un vehículo por su ID.
        Recibe el ID del vehículo en la URL.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable String id) {
        vehicleService.deleteVehicle(UUID.fromString(id));
        return ResponseEntity.noContent().build();
    }

    /*
        Endpoint para obtener todos los vehículos.
        Retorna una lista de VehicleResponseDTO.
        Vista pública: sin teléfono de aseguradora ni historial interno.
     */
    @GetMapping
    public ResponseEntity<List<VehicleResponseDTO>> getAllVehicles(org.springframework.security.core.Authentication authentication) {
        List<VehicleResponseDTO> list = vehicleService.getAllVehicles();
        return ResponseEntity.ok(toPublicIfNeeded(list, authentication));
    }

    /*
        Endpoint para obtener un vehículo por su ID.
        Recibe el ID del vehículo en la URL y retorna un VehicleResponseDTO.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponseDTO> getVehicleById(@PathVariable String id, org.springframework.security.core.Authentication authentication) {
        VehicleResponseDTO dto = vehicleService.getVehicleById(UUID.fromString(id));
        return ResponseEntity.ok(toPublicIfNeeded(dto, authentication));
    }

    private boolean isAdmin(org.springframework.security.core.Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private VehicleResponseDTO toPublicIfNeeded(VehicleResponseDTO dto, org.springframework.security.core.Authentication authentication) {
        if (isAdmin(authentication)) return dto;
        dto.setInsurancePhone(null);
        dto.setMaintenanceRecords(null);
        return dto;
    }

    private List<VehicleResponseDTO> toPublicIfNeeded(List<VehicleResponseDTO> list, org.springframework.security.core.Authentication authentication) {
        if (isAdmin(authentication)) return list;
        list.forEach(dto -> {
            dto.setInsurancePhone(null);
            dto.setMaintenanceRecords(null);
        });
        return list;
    }

}
