package com.terryfoxrun.api.dto;

public record EventFormFieldConfigDto(
        Long id,
        String fieldKey,
        String label,
        String visibility,
        String appliesTo,
        Integer displayOrder
) {
}
