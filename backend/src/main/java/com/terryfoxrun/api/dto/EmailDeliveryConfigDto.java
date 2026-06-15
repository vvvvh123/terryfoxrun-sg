package com.terryfoxrun.api.dto;

public record EmailDeliveryConfigDto(
        boolean smtpConfigured,
        String message
) {
}
