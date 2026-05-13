package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentRejectRequest(
        @NotBlank String rejectionReason,
        String verifiedBy
) {
}
