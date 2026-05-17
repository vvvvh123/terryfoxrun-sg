package com.terryfoxrun.api.dto;

public record ContactSubmissionResponse(
        Long id,
        String status,
        String recipientEmail
) {
}
