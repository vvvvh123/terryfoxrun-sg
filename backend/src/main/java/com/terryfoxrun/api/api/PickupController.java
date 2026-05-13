package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.PickupScanRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pickup")
public class PickupController {

    private final com.terryfoxrun.api.service.PickupService pickupService;

    public PickupController(com.terryfoxrun.api.service.PickupService pickupService) {
        this.pickupService = pickupService;
    }

    @PostMapping("/scan")
    public ResponseEntity<Object> scan(@Valid @RequestBody PickupScanRequest request) {
        return pickupService.markCollected(request.tokenOrCode())
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

