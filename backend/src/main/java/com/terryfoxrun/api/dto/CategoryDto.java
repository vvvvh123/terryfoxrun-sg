package com.terryfoxrun.api.dto;

public record CategoryDto(
        Long id,
        Long eventId,
        String name,
        String description,
        Integer basePrice,
        boolean isActive
) {
}

