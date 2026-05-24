package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.CorporatePackageDto;
import com.terryfoxrun.api.service.CorporatePackageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/{eventId}/corporate-packages")
public class CorporatePackageController {
    private final CorporatePackageService corporatePackageService;

    public CorporatePackageController(CorporatePackageService corporatePackageService) {
        this.corporatePackageService = corporatePackageService;
    }

    @GetMapping
    public ResponseEntity<Object> list(@PathVariable Long eventId,
                                       @RequestParam(defaultValue = "false") boolean activeOnly) {
        return ResponseEntity.ok(corporatePackageService.list(eventId, activeOnly));
    }

    @PostMapping
    public ResponseEntity<Object> create(@PathVariable Long eventId, @RequestBody CorporatePackageDto request) {
        return ResponseEntity.ok(corporatePackageService.create(eventId, request));
    }

    @PatchMapping("/{packageId}")
    public ResponseEntity<Object> update(@PathVariable Long packageId, @RequestBody CorporatePackageDto request) {
        return ResponseEntity.ok(corporatePackageService.update(packageId, request));
    }

    @DeleteMapping("/{packageId}")
    public ResponseEntity<Void> delete(@PathVariable Long packageId) {
        corporatePackageService.delete(packageId);
        return ResponseEntity.noContent().build();
    }
}
