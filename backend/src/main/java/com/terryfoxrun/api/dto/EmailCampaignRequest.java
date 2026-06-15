package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.NotBlank;

public record EmailCampaignRequest(
        @NotBlank String audience,
        @NotBlank String subject,
        @NotBlank String body,
        @NotBlank String deliveryMode
) {
}
