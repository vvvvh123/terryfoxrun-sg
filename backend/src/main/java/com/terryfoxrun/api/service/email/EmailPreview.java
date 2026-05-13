package com.terryfoxrun.api.service.email;

import java.time.Instant;

public record EmailPreview(
        String template,
        String to,
        String subject,
        String body,
        Long registrationId,
        Instant createdAt
) {
}
