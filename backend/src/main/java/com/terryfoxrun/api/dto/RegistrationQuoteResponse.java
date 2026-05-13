package com.terryfoxrun.api.dto;

import java.util.List;

public record RegistrationQuoteResponse(
        Integer subtotal,
        Integer shirtsTotal,
        Integer donationTotal,
        Integer grandTotal,
        List<String> inventoryWarnings
) {
}

