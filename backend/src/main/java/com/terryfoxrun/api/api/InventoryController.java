package com.terryfoxrun.api.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events/{eventId}/inventory")
public class InventoryController {

    private final com.terryfoxrun.api.service.InventoryService inventoryService;

    public InventoryController(com.terryfoxrun.api.service.InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<Object> getInventory(@PathVariable Long eventId) {
        return ResponseEntity.ok(inventoryService.getInventory(eventId));
    }

    @PatchMapping
    public ResponseEntity<Object> updateInventory(@PathVariable Long eventId, @RequestBody java.util.List<com.terryfoxrun.api.dto.EventDto.ShirtSizeDto> items) {
        inventoryService.updateInventory(eventId, items);
        return ResponseEntity.ok().build();
    }
}

