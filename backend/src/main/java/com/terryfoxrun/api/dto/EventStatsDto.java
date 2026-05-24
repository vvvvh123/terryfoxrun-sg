package com.terryfoxrun.api.dto;

import java.util.List;

public record EventStatsDto(
        Integer confirmedAmount,
        Integer pendingAmount,
        Integer confirmedPaymentCount,
        Integer pendingPaymentCount,
        List<DailyAmountDto> dailyAmounts
) {
    public record DailyAmountDto(
            String date,
            Integer confirmedAmount,
            Integer pendingAmount,
            Integer cumulativeConfirmedAmount,
            Integer cumulativePendingAmount
    ) {
    }
}
