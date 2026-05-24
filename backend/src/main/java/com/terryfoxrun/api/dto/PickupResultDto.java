package com.terryfoxrun.api.dto;

import java.time.Instant;
import java.util.List;

public record PickupResultDto(
        String result,
        String message,
        Long registrationId,
        String payerName,
        String payerEmail,
        String paymentStatus,
        Integer totalAmount,
        Long participantId,
        String participantName,
        String categoryName,
        String tshirtSize,
        String tshirtType,
        Integer tshirtQty,
        List<RegistrationQuoteRequest.ShirtOrderDto> shirtOrders,
        String pickupCode,
        String pickupStatus,
        Instant pickupTimestamp,
        String pickupCollectedBy
) {
}
