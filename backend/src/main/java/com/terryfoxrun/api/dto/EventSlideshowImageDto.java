package com.terryfoxrun.api.dto;

public record EventSlideshowImageDto(
        Long id,
        String imageUrl,
        String blurb,
        Integer displayOrder,
        boolean active
) {
}
