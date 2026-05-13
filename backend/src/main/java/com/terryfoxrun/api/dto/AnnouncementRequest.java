package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.NotBlank;

public record AnnouncementRequest(
        @NotBlank String title,
        @NotBlank String body,
        boolean channelEmail,
        boolean channelDashboard
) {
}

