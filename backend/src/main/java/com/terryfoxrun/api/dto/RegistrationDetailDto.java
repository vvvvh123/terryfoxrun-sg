package com.terryfoxrun.api.dto;

import java.time.Instant;
import java.util.List;

public record RegistrationDetailDto(
        Long id,
        Long eventId,
        String eventName,
        String payerName,
        String payerEmail,
        String payerIdentityNumber,
        String payerAddress,
        String payerBloodType,
        String status,
        String paymentStatus,
        Integer totalAmount,
        String generatedPaymentReference,
        boolean indemnityAccepted,
        Instant createdAt,
        List<ParticipantDto> participants,
        List<PaymentAttemptDto> paymentAttempts
) {
    public record ParticipantDto(
            Long id,
            Long categoryId,
            String categoryName,
            String name,
            String email,
            String phone,
            String address,
            String nricLast4,
            String medicalNotes,
            String tshirtSize,
            String tshirtType,
            Integer tshirtQty,
            String pickupCode,
            String pickupStatus
    ) {
    }
}
