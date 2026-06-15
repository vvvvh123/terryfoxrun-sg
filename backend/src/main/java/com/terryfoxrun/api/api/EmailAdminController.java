package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.EmailDeliveryConfigDto;
import com.terryfoxrun.api.service.EmailDeliveryConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/email")
public class EmailAdminController {
    private final EmailDeliveryConfigService emailDeliveryConfigService;

    public EmailAdminController(EmailDeliveryConfigService emailDeliveryConfigService) {
        this.emailDeliveryConfigService = emailDeliveryConfigService;
    }

    @GetMapping("/configuration")
    public ResponseEntity<EmailDeliveryConfigDto> getConfiguration() {
        return ResponseEntity.ok(emailDeliveryConfigService.getConfiguration());
    }
}
