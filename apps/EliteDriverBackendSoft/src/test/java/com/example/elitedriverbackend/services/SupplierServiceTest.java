package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.domain.entity.*;
import com.example.elitedriverbackend.domain.dtos.*;
import com.example.elitedriverbackend.repositories.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SupplierServiceTest {
    final SupplierRepository suppliers=mock(SupplierRepository.class);
    final VehicleRepository vehicles=mock(VehicleRepository.class);
    final SupplierService service=new SupplierService(suppliers,vehicles);
    final UUID id=UUID.randomUUID();
    final Supplier supplier=Supplier.builder().id(id).name("Proveedor").build();
    @Test void savesOptionalContactAndTrimsName() {
        when(suppliers.saveAndFlush(any())).thenAnswer(i->{Supplier s=i.getArgument(0);s.setId(id);return s;});
        var saved=service.save(null,SupplierDTO.builder().name("  Proveedor  ").phone("  ").email("").build());
        assertEquals("Proveedor",saved.getName());assertNull(saved.getPhone());assertNull(saved.getEmail());assertEquals(0,saved.getVehicleCount());
    }
    @Test void refusesToDeleteAnOwnerWithVehicles() {
        when(suppliers.findLocked(id)).thenReturn(Optional.of(supplier));when(vehicles.countBySupplier_Id(id)).thenReturn(2L);
        assertEquals(409,assertThrows(ResponseStatusException.class,()->service.delete(id)).getStatusCode().value());verify(suppliers,never()).delete(any());
    }
    @Test void canDeleteAnUnusedSupplier() {
        when(suppliers.findLocked(id)).thenReturn(Optional.of(supplier));service.delete(id);verify(suppliers).delete(supplier);
    }
    @Test void clearingAnOwnerIsDifferentFromNotUpdatingIt() throws Exception {
        ObjectMapper mapper=new ObjectMapper();
        var omitted=mapper.readValue("{\"kilometers\":100}",UpdateVehicleDTO.class);
        assertFalse(omitted.isSupplierSpecified());
        var own=mapper.readValue("{\"supplierId\":null}",UpdateVehicleDTO.class);
        assertTrue(own.isSupplierSpecified());assertNull(own.getSupplierId());
        var assigned=mapper.readValue("{\"supplierId\":\""+id+"\"}",UpdateVehicleDTO.class);
        assertTrue(assigned.isSupplierSpecified());assertEquals(id,assigned.getSupplierId());
    }
}
