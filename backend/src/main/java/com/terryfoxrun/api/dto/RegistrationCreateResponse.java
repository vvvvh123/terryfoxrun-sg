package com.terryfoxrun.api.dto;

public record RegistrationCreateResponse(
        Long registrationId,
        String generatedPaymentReference,
        Integer totalAmount,
        String status,
        String paymentStatus
) {
}
