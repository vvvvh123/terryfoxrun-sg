package com.terryfoxrun.api.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record EventDto(
        Long id,
        String name,
        Integer year,
        boolean isCurrent,
        String status,
        Instant registrationOpen,
        Instant registrationClose,
        Instant eventStart,
        Instant eventEnd,
        Instant pickupStart,
        Instant pickupEnd,
        String locationEvent,
        String locationPickup,
        Map<String, Object> fieldFlags,
        List<Integer> donationPresets,
        Integer shirtPrice,
        List<ShirtSizeDto> shirtSizes,
        BrandingDto branding
) {

    public record ShirtSizeDto(String type, String size, Integer quantityAvailable) {
    }

    public record BrandingDto(String primary, String secondary, String accent) {
    }
}

