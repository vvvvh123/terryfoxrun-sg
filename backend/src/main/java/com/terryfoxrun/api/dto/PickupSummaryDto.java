package com.terryfoxrun.api.dto;

import java.time.Instant;
import java.util.List;

public record PickupSummaryDto(
        long collectedCount,
        long pendingCount,
        List<Item> collected
) {
    public record Item(
            Long participantId,
            Long registrationId,
            String participantName,
            String pickupCode,
            String tshirtSize,
            String tshirtType,
            Integer tshirtQty,
            Instant pickupTimestamp
    ) {
    }
}
