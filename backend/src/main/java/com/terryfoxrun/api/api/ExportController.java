package com.terryfoxrun.api.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events/{eventId}/exports")
public class ExportController {

    private final com.terryfoxrun.api.service.ExportService exportService;

    public ExportController(com.terryfoxrun.api.service.ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/registrations.csv")
    public ResponseEntity<byte[]> registrationsCsv(@PathVariable Long eventId) {
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .body(exportService.registrationsCsv(eventId));
    }

    @GetMapping("/corporate-orders.csv")
    public ResponseEntity<byte[]> corporateOrdersCsv(@PathVariable Long eventId) {
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .body(exportService.corporateCsv(eventId));
    }

    @GetMapping("/finance.csv")
    public ResponseEntity<byte[]> financeCsv(@PathVariable Long eventId) {
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .body(exportService.financeCsv(eventId));
    }

    @GetMapping("/inventory.csv")
    public ResponseEntity<byte[]> inventoryCsv(@PathVariable Long eventId) {
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .body(exportService.inventoryCsv(eventId));
    }
}
