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
        @NotNull List<Item> items
) {
    public record Item(
            @NotBlank String size,
            @NotBlank String type,
            @NotNull Integer quantity
    ) {
    }
}

