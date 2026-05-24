package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.EmailCampaignRequest;
import com.terryfoxrun.api.service.EmailCampaignService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/{eventId}/email-campaigns")
public class EmailCampaignController {
    private final EmailCampaignService emailCampaignService;

    public EmailCampaignController(EmailCampaignService emailCampaignService) {
        this.emailCampaignService = emailCampaignService;
    }

    @GetMapping
    public ResponseEntity<Object> list(@PathVariable Long eventId) {
        return ResponseEntity.ok(emailCampaignService.list(eventId));
    }

    @GetMapping("/audiences")
    public ResponseEntity<Object> audiences(@PathVariable Long eventId) {
        return ResponseEntity.ok(emailCampaignService.audiences(eventId));
    }

    @PostMapping
    public ResponseEntity<Object> create(@PathVariable Long eventId,
                                         @Valid @RequestBody EmailCampaignRequest request,
                                         @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(emailCampaignService.create(eventId, userId == null ? "admin" : userId, request));
    }
}
