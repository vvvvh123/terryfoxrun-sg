package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.ShirtInventory;
import com.terryfoxrun.api.dto.EventDto;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.ShirtInventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {

    private final EventRepository eventRepository;
    private final ShirtInventoryRepository shirtInventoryRepository;

    public InventoryService(EventRepository eventRepository, ShirtInventoryRepository shirtInventoryRepository) {
        this.eventRepository = eventRepository;
        this.shirtInventoryRepository = shirtInventoryRepository;
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
}

