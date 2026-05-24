package com.terryfoxrun.api.dto;

import java.time.Instant;
import java.util.List;

public record CorporateOrderDto(
        Long id,
        Long eventId,
        String companyName,
        String companyAddress,
        String uen,
        String contactName,
        String contactEmail,
        String contactPhone,
        Long corporatePackageId,
        String corporatePackageName,
        String status,
        Instant createdAt,
        List<Item> items
) {
    public record Item(Long id, String size, String type, Integer quantity) {
    }
}
