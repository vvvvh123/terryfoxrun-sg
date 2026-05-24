package com.terryfoxrun.api.dto;

import java.time.Instant;

public record AnnouncementDto(
        Long id,
        Long eventId,
        String title,
        String body,
        boolean channelEmail,
        boolean channelDashboard,
        String createdBy,
        Instant createdAt
) {
}
