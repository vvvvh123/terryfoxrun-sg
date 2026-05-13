package com.terryfoxrun.api.dto;

import com.terryfoxrun.api.domain.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PaymentSubmitRequest(
        @NotNull PaymentMethod method,
        @NotBlank String userTransactionId,
        String proofFileUrl
) {
}
