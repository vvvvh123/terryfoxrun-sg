package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CorporateOrderRequest(
        @NotNull Long eventId,
        @NotBlank String companyName,
        @NotBlank String companyAddress,
        @NotBlank String uen,
        @NotBlank String contactName,
        @Email String contactEmail,
        @NotBlank String contactPhone,
        Long corporatePackageId,
        @NotNull List<Item> items
) {
    public CorporateOrderRequest(
            Long eventId,
            String companyName,
            String companyAddress,
            String uen,
            String contactName,
            String contactEmail,
            String contactPhone,
            List<Item> items) {
        this(eventId, companyName, companyAddress, uen, contactName, contactEmail, contactPhone, null, items);
    }

    public record Item(
            @NotBlank String size,
            @NotBlank String type,
            @NotNull Integer quantity
    ) {
    }
}
