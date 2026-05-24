package com.terryfoxrun.api.dto;

import java.time.Instant;

public record EmailCampaignDto(
        Long id,
        Long eventId,
        String audience,
        String subject,
        String body,
        String sentStatus,
        String createdBy,
        Instant createdAt,
        Instant sentAt
) {
}
