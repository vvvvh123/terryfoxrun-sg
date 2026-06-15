package com.terryfoxrun.api.service;

import com.terryfoxrun.api.dto.EmailDeliveryConfigDto;
import com.terryfoxrun.api.service.email.EmailService;
import org.springframework.stereotype.Service;

@Service
public class EmailDeliveryConfigService {
    private final EmailService emailService;

    public EmailDeliveryConfigService(EmailService emailService) {
        this.emailService = emailService;
    }

    public EmailDeliveryConfigDto getConfiguration() {
        boolean configured = emailService.isLiveDeliveryAvailable();
        return new EmailDeliveryConfigDto(
                configured,
                configured
                        ? "Live email sending is enabled."
                        : "SMTP is not configured yet. Drafts and previews are still available.");
    }
}
