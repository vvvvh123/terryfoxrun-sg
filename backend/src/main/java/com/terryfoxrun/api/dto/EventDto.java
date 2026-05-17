package com.terryfoxrun.api.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record EventDto(
        Long id,
        String name,
        Integer year,
        boolean isCurrent,
        String status,
        Instant registrationOpen,
        Instant registrationClose,
        Instant eventStart,
        Instant eventEnd,
        Instant pickupStart,
        Instant pickupEnd,
        String locationEvent,
        String locationPickup,
        Map<String, Object> fieldFlags,
        List<Integer> donationPresets,
        Integer shirtPrice,
        List<ShirtSizeDto> shirtSizes,
        BrandingDto branding,
        PaymentInstructionsDto paymentInstructions,
        EventDetailsDto eventDetails,
        List<FaqDto> faqs,
        String contactRecipientEmail,
        SocialLinksDto socialLinks
) {

    public record ShirtSizeDto(String type, String size, Integer quantityAvailable) {
    }

    public record BrandingDto(String primary, String secondary, String accent) {
    }

    public record PaymentInstructionsDto(
            String payNowQrImageUrl,
            String payNowInstruction,
            String bankName,
            String bankAccountNumber,
            String bankAccountName,
            String bankInstruction,
            String proofBucket
    ) {
    }

    public record EventDetailsDto(
            String scheduleSummary,
            String routeNotes,
            String tshirtTitle,
            String tshirtDescription,
            String tshirtFrontImageUrl,
            String tshirtBackImageUrl,
            String kidsSizeChartImageUrl,
            String adultSizeChartImageUrl,
            String pickupDisclaimer,
            String donationNote
    ) {
    }

    public record FaqDto(
            String question,
            String answer,
            Integer displayOrder,
            boolean active
    ) {
    }

    public record SocialLinksDto(
            String instagramUrl,
            String instagramLogoUrl,
            String facebookUrl,
            String facebookLogoUrl
    ) {
    }
}
