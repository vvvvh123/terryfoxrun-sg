package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentConfirmRequest(
        @NotBlank String adminTransactionId,
        @NotBlank String verifiedBy
) {
}
