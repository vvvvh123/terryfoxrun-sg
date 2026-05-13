package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.ShirtInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShirtInventoryRepository extends JpaRepository<ShirtInventory, Long> {
    List<ShirtInventory> findByEvent(Event event);
    Optional<ShirtInventory> findByEventIdAndTypeAndSize(Long eventId, String type, String size);
}
