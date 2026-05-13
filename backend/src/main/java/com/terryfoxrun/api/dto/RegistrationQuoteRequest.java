package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record RegistrationQuoteRequest(
        @NotNull Long eventId,
        @NotNull List<ParticipantInput> participants,
        Integer donationAmount,
        List<ShirtOrderDto> extraShirts
) {
    public record ShirtOrderDto(String size, String type, Integer quantity) {
    }
}

