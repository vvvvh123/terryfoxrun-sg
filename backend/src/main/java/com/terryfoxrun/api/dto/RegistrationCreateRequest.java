package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record RegistrationCreateRequest(
        @NotNull Long eventId,
        String payerName,
        String payerEmail,
        String payerIdentityNumber,
        String payerAddress,
        String payerBloodType,
        @NotNull List<ParticipantInput> participants,
        Integer donationAmount,
        List<RegistrationQuoteRequest.ShirtOrderDto> extraShirts,
        boolean indemnityAccepted,
        String successUrl,
        String cancelUrl
) {
}
