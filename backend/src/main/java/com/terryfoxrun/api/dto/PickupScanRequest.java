package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.NotBlank;

public record PickupScanRequest(@NotBlank String tokenOrCode) {
}

