package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.CorporateOrderRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/corporate-orders")
public class CorporateOrderController {

    private final com.terryfoxrun.api.service.CorporateOrderService corporateOrderService;

    public CorporateOrderController(com.terryfoxrun.api.service.CorporateOrderService corporateOrderService) {
        this.corporateOrderService = corporateOrderService;
    }

    @PostMapping
    public ResponseEntity<Object> createOrder(@Valid @RequestBody CorporateOrderRequest request) {
        return ResponseEntity.ok(corporateOrderService.create(request).getId());
    }

    @GetMapping
    public ResponseEntity<Object> listOrders(@RequestParam Long eventId) {
        return ResponseEntity.ok(corporateOrderService.list(eventId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(corporateOrderService.get(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Object> updateOrder(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(corporateOrderService.updateStatus(id, status));
    }
}

