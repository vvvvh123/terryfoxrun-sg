package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    List<InventoryMovement> findByRegistrationId(Long registrationId);
    List<InventoryMovement> findByEventOrderByCreatedAtAsc(Event event);
}
