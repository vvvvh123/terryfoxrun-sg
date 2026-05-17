package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.RegistrationCreateRequest;
import com.terryfoxrun.api.dto.RegistrationCreateResponse;
import com.terryfoxrun.api.dto.RegistrationDetailDto;
import com.terryfoxrun.api.dto.RegistrationQuoteRequest;
import com.terryfoxrun.api.dto.RegistrationQuoteResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final com.terryfoxrun.api.service.RegistrationService registrationService;

    public RegistrationController(com.terryfoxrun.api.service.RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/quote")
    public ResponseEntity<RegistrationQuoteResponse> quote(@Valid @RequestBody RegistrationQuoteRequest request) {
        return ResponseEntity.ok(registrationService.quote(request));
    }

    @PostMapping
    public ResponseEntity<RegistrationCreateResponse> create(@Valid @RequestBody RegistrationCreateRequest request,
                                                             Authentication authentication) {
        String payer = authentication != null ? authentication.getName() : "anonymous";
        return ResponseEntity.ok(registrationService.toCreateResponse(registrationService.create(payer, request)));
    }

    @GetMapping("/me")
    public ResponseEntity<List<RegistrationDetailDto>> myRegistrations(Authentication authentication) {
        String payer = authentication != null ? authentication.getName() : "anonymous";
        return ResponseEntity.ok(registrationService.getMyRegistrationDetails(payer));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistrationDetailDto> getRegistration(@PathVariable Long id) {
        return registrationService.getRegistrationDetail(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
