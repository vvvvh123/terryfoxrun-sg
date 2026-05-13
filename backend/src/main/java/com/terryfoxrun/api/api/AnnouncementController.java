package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.AnnouncementRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/{eventId}/announcements")
public class AnnouncementController {

    private final com.terryfoxrun.api.service.AnnouncementService announcementService;

    public AnnouncementController(com.terryfoxrun.api.service.AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping
    public ResponseEntity<Object> list(@PathVariable Long eventId) {
        return ResponseEntity.ok(announcementService.list(eventId));
    }

    @PostMapping
    public ResponseEntity<Object> create(@PathVariable Long eventId,
                                         @Valid @RequestBody AnnouncementRequest request,
                                         @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String creator = userId != null ? userId : "admin";
        return ResponseEntity.ok(announcementService.create(eventId, creator, request));
    }
}

