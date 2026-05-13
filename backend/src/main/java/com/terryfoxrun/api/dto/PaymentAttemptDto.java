package com.terryfoxrun.api.dto;

import com.terryfoxrun.api.domain.PaymentMethod;

import java.time.Instant;

public record PaymentAttemptDto(
        Long id,
        Long registrationId,
        PaymentMethod method,
        String generatedReference,
        String userTransactionId,
        String adminTransactionId,
        String rejectionReason,
        String proofFileUrl,
        String verificationStatus,
        Long eventId,
        String payerName,
        String payerEmail,
        Integer totalAmount,
        Instant submittedAt,
        Instant verifiedAt
) {
}
