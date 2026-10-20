package com.example.elitedriverbackend.repositories;

import com.example.elitedriverbackend.domain.entity.Supplier;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.*;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
    List<Supplier> findAllByOrderByNameAsc();
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Supplier s WHERE s.id = :id")
    Optional<Supplier> findLocked(@Param("id") UUID id);
}
