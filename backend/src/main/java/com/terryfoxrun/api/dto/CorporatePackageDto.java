package com.terryfoxrun.api.dto;

public record CorporatePackageDto(
        Long id,
        Long eventId,
        String packageName,
        Integer price,
        String shirtAllocationRulesJson,
        boolean active
) {
}
