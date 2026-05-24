package com.terryfoxrun.api.dto;

public record EmailAudienceSegmentDto(
        String key,
        String label,
        String description,
        long count
) {
}
