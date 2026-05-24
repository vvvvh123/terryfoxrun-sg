package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.PickupScanRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public ResponseEntity<Object> scan(@Valid @RequestBody PickupScanRequest request,
                                       @AuthenticationPrincipal Jwt jwt) {
        String actor = jwt == null ? "local-volunteer" : jwt.getSubject();
        return pickupService.scan(request.tokenOrCode(), actor)
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/lookup")
    public ResponseEntity<Object> lookup(@Valid @RequestBody PickupScanRequest request) {
        return pickupService.lookup(request.tokenOrCode())
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/collect")
    public ResponseEntity<Object> collect(@Valid @RequestBody PickupScanRequest request,
                                          @AuthenticationPrincipal Jwt jwt) {
        String actor = jwt == null ? "local-volunteer" : jwt.getSubject();
        return pickupService.collect(request.tokenOrCode(), actor)
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history")
    public ResponseEntity<Object> history(@RequestParam Long eventId,
                                          @RequestParam(required = false) String query,
                                          @RequestParam(required = false) String status) {
        return ResponseEntity.ok(pickupService.history(eventId, query, status));
    }

    @GetMapping("/events/{eventId}/summary")
    public ResponseEntity<Object> summary(@PathVariable Long eventId) {
        return ResponseEntity.ok(pickupService.summary(eventId));
    }
}
