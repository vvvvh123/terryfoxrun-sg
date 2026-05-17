package com.terryfoxrun.api.dto;

public record DailyInventorySoldDto(
        String date,
        String size,
        Integer quantitySold
) {
}
