package com.terryfoxrun.api.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.terryfoxrun.api.dto.EventDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class EventServiceIntegrationTest {

    @Autowired
    private EventService eventService;

    @Test
    void readsSeededCurrentEventWithJsonConfiguration() {
        EventDto event = eventService.getCurrentEvent().orElseThrow();

        assertThat(event.name()).isEqualTo("Terry Fox Run SG");
        assertThat(event.fieldFlags()).containsEntry("allowDonation", true);
        assertThat(event.donationPresets()).containsExactly(20, 50, 100);
        assertThat(event.branding().primary()).isEqualTo("#d90429");
        assertThat(event.paymentInstructions().bankName()).isEqualTo("DBS Bank Pte Ltd");
        assertThat(event.paymentInstructions().proofBucket()).isEqualTo("payment-proofs");
        assertThat(event.eventDetails().tshirtTitle()).contains("Terry Fox Run T-Shirt");
        assertThat(event.faqs()).isNotEmpty();
        assertThat(event.contactRecipientEmail()).isEqualTo("corporate@terryfoxrun.global");
        assertThat(event.socialLinks().instagramUrl()).contains("instagram.com/terryfoxrunsingapore");
    }
}
