package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.AdminRegistrationReportDto;
import com.terryfoxrun.api.dto.AdminRoleUsersDto;
import com.terryfoxrun.api.dto.EventStatsDto;
import com.terryfoxrun.api.service.AdminReportService;
import com.terryfoxrun.api.service.SupabaseRoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AdminReportController {
    private final AdminReportService adminReportService;
    private final SupabaseRoleService supabaseRoleService;

    public AdminReportController(AdminReportService adminReportService, SupabaseRoleService supabaseRoleService) {
        this.adminReportService = adminReportService;
        this.supabaseRoleService = supabaseRoleService;
    }

    @GetMapping("/admin/roles/users")
    public ResponseEntity<AdminRoleUsersDto> roleUsers() {
        return ResponseEntity.ok(supabaseRoleService.listUsers());
    }

    @GetMapping("/events/{eventId}/stats")
    public ResponseEntity<EventStatsDto> eventStats(@PathVariable Long eventId) {
        return ResponseEntity.ok(adminReportService.stats(eventId));
    }

    @GetMapping("/events/{eventId}/registrations")
    public ResponseEntity<AdminRegistrationReportDto> registrations(@PathVariable Long eventId,
                                                                    @RequestParam(required = false) String query,
                                                                    @RequestParam(required = false) String paymentStatus,
                                                                    @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminReportService.registrations(eventId, query, paymentStatus, status));
    }
}
