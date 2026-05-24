package com.terryfoxrun.api.dto;

import java.time.Instant;
import java.util.List;

public record AdminRegistrationReportDto(
        RegistrationCounts counts,
        List<DailyRegistrationCountDto> dailyRegistrations,
        List<RegistrationRowDto> registrations
) {
    public record RegistrationCounts(
            long total,
            long confirmed,
            long pendingPayment,
            long rejected
    ) {
    }

    public record DailyRegistrationCountDto(
            String date,
            long count
    ) {
    }

    public record RegistrationRowDto(
            Long id,
            String payerName,
            String payerEmail,
            String generatedPaymentReference,
            String status,
            String paymentStatus,
            Integer totalAmount,
            Instant createdAt,
            int participantCount,
            String shirtSummary
    ) {
    }
}
