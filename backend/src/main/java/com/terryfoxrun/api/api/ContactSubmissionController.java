package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.ContactSubmissionRequest;
import com.terryfoxrun.api.dto.ContactSubmissionResponse;
import com.terryfoxrun.api.service.ContactSubmissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/{eventId}/contact-submissions")
public class ContactSubmissionController {
    private final ContactSubmissionService contactSubmissionService;

    public ContactSubmissionController(ContactSubmissionService contactSubmissionService) {
        this.contactSubmissionService = contactSubmissionService;
    }

    @PostMapping
    public ResponseEntity<ContactSubmissionResponse> submit(@PathVariable Long eventId,
                                                            @Valid @RequestBody ContactSubmissionRequest request) {
        return ResponseEntity.ok(contactSubmissionService.submit(eventId, request));
    }
}
