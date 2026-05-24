package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.InventoryMovement;
import com.terryfoxrun.api.domain.ShirtInventory;
import com.terryfoxrun.api.dto.DailyInventorySoldDto;
import com.terryfoxrun.api.dto.EventDto;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.InventoryMovementRepository;
import com.terryfoxrun.api.repo.ShirtInventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class InventoryService {

    private final EventRepository eventRepository;
    private final ShirtInventoryRepository shirtInventoryRepository;
    private final InventoryMovementRepository inventoryMovementRepository;

    public InventoryService(EventRepository eventRepository,
                            ShirtInventoryRepository shirtInventoryRepository,
                            InventoryMovementRepository inventoryMovementRepository) {
        this.eventRepository = eventRepository;
        this.shirtInventoryRepository = shirtInventoryRepository;
        this.inventoryMovementRepository = inventoryMovementRepository;
    }

    @Transactional(readOnly = true)
    public List<EventDto.ShirtSizeDto> getInventory(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return shirtInventoryRepository.findByEvent(event).stream()
                .map(inv -> new EventDto.ShirtSizeDto(inv.getType(), inv.getSize(), inv.getQuantityAvailable()))
                .toList();
    }

    @Transactional
    public void updateInventory(Long eventId, List<EventDto.ShirtSizeDto> items) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        shirtInventoryRepository.findByEvent(event).forEach(shirtInventoryRepository::delete);
        for (EventDto.ShirtSizeDto dto : items) {
            ShirtInventory inv = new ShirtInventory();
            inv.setEvent(event);
            inv.setType(dto.type());
            inv.setSize(dto.size());
            inv.setQuantityAvailable(dto.quantityAvailable());
            inv.setQuantityReserved(0);
            inv.setQuantitySold(0);
            shirtInventoryRepository.save(inv);
        }
    }

    @Transactional(readOnly = true)
    public List<DailyInventorySoldDto> getDailySold(Long eventId, String size) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        String normalizedSize = size == null || size.isBlank() ? "ALL" : size;
        Map<String, Integer> totals = new TreeMap<>();
        for (InventoryMovement movement : inventoryMovementRepository.findByEventOrderByCreatedAtAsc(event)) {
            if (!"REGISTRATION_PAYMENT_CONFIRMED".equals(movement.getReason())
                    && !"REGISTRATION_NO_PAYMENT_REQUIRED".equals(movement.getReason())) {
                continue;
            }
            if (!"ALL".equalsIgnoreCase(normalizedSize) && !normalizedSize.equalsIgnoreCase(movement.getSize())) {
                continue;
            }
            String day = movement.getCreatedAt().toLocalDate().toString();
            int sold = Math.abs(Math.min(0, movement.getQuantityDelta() == null ? 0 : movement.getQuantityDelta()));
            totals.merge(day, sold, Integer::sum);
        }
        return totals.entrySet().stream()
                .map(entry -> new DailyInventorySoldDto(entry.getKey(), normalizedSize.toUpperCase(), entry.getValue()))
                .toList();
    }
}
