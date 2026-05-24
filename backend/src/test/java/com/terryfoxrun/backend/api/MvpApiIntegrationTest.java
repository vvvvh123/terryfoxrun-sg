package com.terryfoxrun.api.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.terryfoxrun.api.domain.EventFormFieldConfig;
import com.terryfoxrun.api.domain.EventSlideshowImage;
import com.terryfoxrun.api.domain.PaymentAttempt;
import com.terryfoxrun.api.dto.ParticipantInput;
import com.terryfoxrun.api.dto.CorporateOrderRequest;
import com.terryfoxrun.api.dto.PaymentSubmitRequest;
import com.terryfoxrun.api.dto.RegistrationCreateRequest;
import com.terryfoxrun.api.dto.RegistrationQuoteRequest;
import com.terryfoxrun.api.repo.EventFormFieldConfigRepository;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.EventSlideshowImageRepository;
import com.terryfoxrun.api.repo.PaymentAttemptRepository;
import com.terryfoxrun.api.repo.RegistrationParticipantRepository;
import com.terryfoxrun.api.repo.RegistrationRepository;
import com.terryfoxrun.api.repo.RegistrationShirtRepository;
import com.terryfoxrun.api.service.email.LocalEmailService;
import com.terryfoxrun.api.repo.CategoryRepository;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class MvpApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private EventSlideshowImageRepository slideshowImageRepository;

    @Autowired
    private EventFormFieldConfigRepository formFieldConfigRepository;

    @Autowired
    private PaymentAttemptRepository paymentAttemptRepository;

    @Autowired
    private RegistrationParticipantRepository participantRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private RegistrationShirtRepository registrationShirtRepository;

    @Autowired
    private LocalEmailService localEmailService;

    @Test
    void servesAndReplacesSlideshowImages() throws Exception {
        Long eventId = eventRepository.findFirstByCurrentTrue().orElseThrow().getId();

        mockMvc.perform(put("/api/events/{eventId}/slideshow", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(
                                Map.of("imageUrl", "https://example.com/terry.jpg", "blurb", "Terry Fox legacy", "displayOrder", 1, "active", true),
                                Map.of("imageUrl", "https://example.com/singapore.jpg", "blurb", "Singapore run morning", "displayOrder", 2, "active", true)))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].blurb").value("Terry Fox legacy"));

        mockMvc.perform(get("/api/events/{eventId}/slideshow", eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[1].imageUrl").value("https://example.com/singapore.jpg"));

        List<EventSlideshowImage> saved = slideshowImageRepository.findByEventAndActiveTrueOrderByDisplayOrderAsc(
                eventRepository.findById(eventId).orElseThrow());
        assertThat(saved).hasSize(2);
    }

    @Test
    void listsCopiesAndSelectsEvents() throws Exception {
        Long eventId = eventRepository.findFirstByCurrentTrue().orElseThrow().getId();
        String eventJson = mockMvc.perform(get("/api/events/{eventId}", eventId))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        ObjectNode eventPayload = (ObjectNode) objectMapper.readTree(eventJson);
        ObjectNode eventDetailsPayload = eventPayload.withObject("/eventDetails");
        eventDetailsPayload.put("scheduleSummary", "Flag-off at 7am.");
        eventDetailsPayload.put("indemnityText", "I understand the risks of participating in the Terry Fox Run.");
        eventDetailsPayload.put("pdpaConsentText", "I consent to Terry Fox Run Singapore collecting my registration details for event operations.");
        eventDetailsPayload.put("refundCancellationText", "T-shirt purchases and donations are non-refundable once confirmed.");

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/events/{eventId}", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(eventPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventDetails.indemnityText").value("I understand the risks of participating in the Terry Fox Run."))
                .andExpect(jsonPath("$.eventDetails.pdpaConsentText").value("I consent to Terry Fox Run Singapore collecting my registration details for event operations."))
                .andExpect(jsonPath("$.eventDetails.refundCancellationText").value("T-shirt purchases and donations are non-refundable once confirmed."));

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").exists());

        String copiedJson = mockMvc.perform(post("/api/events/{eventId}/copy", eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isCurrent").value(false))
                .andExpect(jsonPath("$.eventDetails.indemnityText").value("I understand the risks of participating in the Terry Fox Run."))
                .andExpect(jsonPath("$.eventDetails.pdpaConsentText").value("I consent to Terry Fox Run Singapore collecting my registration details for event operations."))
                .andExpect(jsonPath("$.eventDetails.refundCancellationText").value("T-shirt purchases and donations are non-refundable once confirmed."))
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long copiedEventId = objectMapper.readTree(copiedJson).get("id").asLong();

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/events/{eventId}/current", copiedEventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isCurrent").value(true));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/events/{eventId}/current", eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isCurrent").value(true));

        mockMvc.perform(delete("/api/events/{eventId}", copiedEventId))
                .andExpect(status().isNoContent());

        assertThat(eventRepository.findById(copiedEventId)).isEmpty();
    }

    @Test
    void acceptsContactSubmissionAndCreatesEmailPreview() throws Exception {
        localEmailService.clear();
        Long eventId = eventRepository.findFirstByCurrentTrue().orElseThrow().getId();

        mockMvc.perform(post("/api/events/{eventId}/contact-submissions", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "firstName", "Alex",
                                "lastName", "Tan",
                                "email", "alex@example.com",
                                "message", "How do I volunteer?"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EMAIL_PREVIEW_CREATED"));

        assertThat(localEmailService.sentEmails())
                .extracting(email -> email.template())
                .contains("contact-submission");
    }

    @Test
    void servesAndReplacesFormFieldConfig() throws Exception {
        Long eventId = eventRepository.findFirstByCurrentTrue().orElseThrow().getId();

        mockMvc.perform(put("/api/events/{eventId}/form-fields", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(
                                Map.of("fieldKey", "payerName", "label", "Name", "visibility", "required", "appliesTo", "payer", "displayOrder", 1),
                                Map.of("fieldKey", "bloodType", "label", "Blood type", "visibility", "optional", "appliesTo", "participant", "displayOrder", 2)))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].fieldKey").value("payerName"));

        mockMvc.perform(get("/api/events/{eventId}/form-fields", eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[1].visibility").value("optional"));

        List<EventFormFieldConfig> saved = formFieldConfigRepository.findByEventOrderByDisplayOrderAsc(
                eventRepository.findById(eventId).orElseThrow());
        assertThat(saved).hasSize(2);
    }

    @Test
    void exposesRegistrationDetailAndAdminPaymentQueue() throws Exception {
        Long eventId = eventRepository.findFirstByCurrentTrue().orElseThrow().getId();
        Long categoryId = categoryRepository.findByEvent(eventRepository.findFirstByCurrentTrue().orElseThrow()).get(0).getId();

        RegistrationCreateRequest createRequest = new RegistrationCreateRequest(
                eventId,
                "Sam Tan",
                "sam@example.com",
                "S1234567A",
                "1 Terry Fox Way, Singapore",
                "O+",
                List.of(new ParticipantInput(
                        categoryId,
                        "Sam Tan",
                        "sam@example.com",
                        "81234567",
                        "Emergency Contact",
                        "87654321",
                        "1990-01-01",
                        "Prefer not to say",
                        "1 Terry Fox Way, Singapore",
                        "123A",
                        "O+",
                        "M",
                        "adult",
                        1)),
                10_00,
                null,
                true,
                null,
                null);

        String createJson = mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long registrationId = objectMapper.readTree(createJson).get("registrationId").asLong();

        mockMvc.perform(post("/api/registrations/{registrationId}/payment-attempts", registrationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PaymentSubmitRequest(
                                com.terryfoxrun.api.domain.PaymentMethod.PAYNOW,
                                "PAYNOW-123",
                                "https://example.com/proof.png"))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/registrations/{registrationId}", registrationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.payerEmail").value("sam@example.com"))
                .andExpect(jsonPath("$.generatedPaymentReference").value(org.hamcrest.Matchers.matchesPattern("TFR2025-\\d{5}")))
                .andExpect(jsonPath("$.participants", hasSize(1)))
                .andExpect(jsonPath("$.paymentAttempts[0].verificationStatus").value("PENDING_ADMIN_VERIFICATION"));

        mockMvc.perform(get("/api/admin/payment-attempts")
                        .param("status", "PENDING_ADMIN_VERIFICATION")
                        .param("method", "PAYNOW")
                        .param("eventId", eventId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].registrationId").value(registrationId))
                .andExpect(jsonPath("$[0].payerName").value("Sam Tan"))
                .andExpect(jsonPath("$[0].payerEmail").value("sam@example.com"))
                .andExpect(jsonPath("$[0].totalAmount").value(4500))
                .andExpect(jsonPath("$[0].proofFileUrl").value("https://example.com/proof.png"));

        Long paymentAttemptId = paymentAttemptRepository.findAll().stream()
                .filter(attempt -> attempt.getRegistration().getId().equals(registrationId))
                .findFirst()
                .orElseThrow()
                .getId();
        mockMvc.perform(post("/api/admin/payment-attempts/{id}/reject", paymentAttemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "rejectionReason", "payment amount did not match",
                                "verifiedBy", "admin@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus").value("PAYMENT_REJECTED"))
                .andExpect(jsonPath("$.rejectionReason").value("payment amount did not match"));

        PaymentAttempt attempt = paymentAttemptRepository.findById(paymentAttemptId).orElseThrow();
        assertThat(attempt.getUserTransactionId()).isEqualTo("PAYNOW-123");
    }

    @Test
    void exportsRegistrationPaymentCorporateAndInventoryCsvs() throws Exception {
        Long eventId = eventRepository.findFirstByCurrentTrue().orElseThrow().getId();
        Long categoryId = categoryRepository.findByEvent(eventRepository.findFirstByCurrentTrue().orElseThrow()).get(0).getId();

        RegistrationCreateRequest createRequest = new RegistrationCreateRequest(
                eventId,
                "Export User",
                "export@example.com",
                "S2222222D",
                "22 Export Road, Singapore",
                "AB+",
                List.of(new ParticipantInput(
                        categoryId,
                        "Export User",
                        "export@example.com",
                        "81230000",
                        "Emergency Contact",
                        "87650000",
                        "1995-01-01",
                        "Prefer not to say",
                        "22 Export Road, Singapore",
                        "222D",
                        null,
                        "S",
                        "adult",
                        1)),
                25_00,
                null,
                true,
                null,
                null);
        mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk());

        CorporateOrderRequest corporateRequest = new CorporateOrderRequest(
                eventId,
                "Export Co",
                "1 Corporate Way",
                "202600001Z",
                "Corporate Lead",
                "lead@example.com",
                "89990000",
                List.of(new CorporateOrderRequest.Item("M", "adult", 5)));
        mockMvc.perform(post("/api/corporate-orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(corporateRequest)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/events/{eventId}/exports/registrations.csv", eventId))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .contains("registration_id,payer_name,payer_email,total_amount,payment_status,created_at")
                        .contains("Export User"));

        mockMvc.perform(get("/api/events/{eventId}/exports/finance.csv", eventId))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .contains("payment_attempt_id,registration_id,payer_email,method,generated_reference,user_transaction_id,verification_status,total_amount"));

        mockMvc.perform(get("/api/events/{eventId}/exports/corporate-orders.csv", eventId))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .contains("corporate_order_id,company_name,uen,contact_email,status,shirt_type,size,quantity")
                        .contains("Export Co"));

        mockMvc.perform(get("/api/events/{eventId}/exports/inventory.csv", eventId))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .contains("shirt_type,size,quantity_available,quantity_reserved,quantity_sold"));
    }

    @Test
    void pickupScanHandlesUnpaidConfirmedDuplicateAndNotFoundCodes() throws Exception {
        Long eventId = eventRepository.findFirstByCurrentTrue().orElseThrow().getId();
        Long categoryId = categoryRepository.findByEvent(eventRepository.findFirstByCurrentTrue().orElseThrow()).get(0).getId();

        RegistrationCreateRequest createRequest = new RegistrationCreateRequest(
                eventId,
                "Pickup User",
                "pickup@example.com",
                "S3333333F",
                "33 Pickup Road, Singapore",
                "A+",
                List.of(new ParticipantInput(
                        categoryId,
                        "Pickup User",
                        "pickup@example.com",
                        "81233333",
                        "Emergency Contact",
                        "87653333",
                        "1993-01-01",
                        "Prefer not to say",
                        "33 Pickup Road, Singapore",
                        "333F",
                        null,
                        "M",
                        "adult",
                        1)),
                0,
                null,
                true,
                null,
                null);
        String createJson = mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long registrationId = objectMapper.readTree(createJson).get("registrationId").asLong();
        String pickupCode = participantRepository.findAll().stream()
                .filter(participant -> participant.getRegistration().getId().equals(registrationId))
                .findFirst()
                .orElseThrow()
                .getPickupCode();

        mockMvc.perform(post("/api/pickup/scan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("tokenOrCode", pickupCode))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("PAYMENT_NOT_CONFIRMED"));

        mockMvc.perform(post("/api/registrations/{registrationId}/payment-attempts", registrationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PaymentSubmitRequest(
                                com.terryfoxrun.api.domain.PaymentMethod.PAYNOW,
                                "PAYNOW-PICKUP",
                                null))))
                .andExpect(status().isOk());

        Long paymentAttemptId = paymentAttemptRepository.findAll().stream()
                .filter(attempt -> attempt.getRegistration().getId().equals(registrationId))
                .findFirst()
                .orElseThrow()
                .getId();
        mockMvc.perform(post("/api/admin/payment-attempts/{id}/confirm", paymentAttemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "adminTransactionId", "BANK-PICKUP",
                                "verifiedBy", "admin@example.com"))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/pickup/scan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("tokenOrCode", pickupCode))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("COLLECTED"))
                .andExpect(jsonPath("$.pickupStatus").value("COLLECTED"));

        mockMvc.perform(post("/api/pickup/scan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("tokenOrCode", pickupCode))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("ALREADY_COLLECTED"));

        mockMvc.perform(get("/api/pickup/events/{eventId}/summary", eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collectedCount").value(1))
                .andExpect(jsonPath("$.collected[0].pickupCode").value(pickupCode));

        mockMvc.perform(post("/api/pickup/scan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("tokenOrCode", "NO-SUCH-CODE"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void registrationSupportsMultipleShirtSizesPerParticipantAndZeroDollarAutoConfirmation() throws Exception {
        Long eventId = eventRepository.findFirstByCurrentTrue().orElseThrow().getId();
        var event = eventRepository.findById(eventId).orElseThrow();
        Integer originalShirtPrice = event.getShirtPrice();
        event.setShirtPrice(0);
        eventRepository.save(event);
        Long categoryId = categoryRepository.findByEvent(event).get(0).getId();

        RegistrationCreateRequest createRequest = new RegistrationCreateRequest(
                eventId,
                "Free Shirt User",
                "free-shirt@example.com",
                "S4444444G",
                "44 Zero Road, Singapore",
                "B+",
                List.of(new ParticipantInput(
                        categoryId,
                        "Free Shirt User",
                        "free-shirt@example.com",
                        "81234444",
                        "Emergency Contact",
                        "87654444",
                        "1994-01-01",
                        "Prefer not to say",
                        "44 Zero Road, Singapore",
                        "444G",
                        null,
                        null,
                        null,
                        null,
                        List.of(
                                new RegistrationQuoteRequest.ShirtOrderDto("S", "adult", 1),
                                new RegistrationQuoteRequest.ShirtOrderDto("M", "adult", 2)))),
                0,
                null,
                true,
                null,
                null);

        String createJson = mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount").value(0))
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.paymentStatus").value("CONFIRMED"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long registrationId = objectMapper.readTree(createJson).get("registrationId").asLong();

        mockMvc.perform(get("/api/registrations/{registrationId}", registrationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.participants[0].shirtOrders", hasSize(2)))
                .andExpect(jsonPath("$.participants[0].shirtOrders[0].size").value("S"))
                .andExpect(jsonPath("$.participants[0].shirtOrders[1].quantity").value(2));

        var registration = registrationRepository.findById(registrationId).orElseThrow();
        assertThat(registrationShirtRepository.findByRegistration(registration))
                .extracting(shirt -> shirt.getSize() + ":" + shirt.getQuantity())
                .contains("S:1", "M:2");

        event.setShirtPrice(originalShirtPrice);
        eventRepository.save(event);
    }

    @Test
    void pickupLookupDoesNotCollectAndCollectRecordsTimestamp() throws Exception {
        Long eventId = eventRepository.findFirstByCurrentTrue().orElseThrow().getId();
        Long categoryId = categoryRepository.findByEvent(eventRepository.findFirstByCurrentTrue().orElseThrow()).get(0).getId();

        RegistrationCreateRequest createRequest = new RegistrationCreateRequest(
                eventId,
                "Lookup User",
                "lookup@example.com",
                "S5555555H",
                "55 Pickup Road, Singapore",
                "A-",
                List.of(new ParticipantInput(
                        categoryId,
                        "Lookup User",
                        "lookup@example.com",
                        "81235555",
                        "Emergency Contact",
                        "87655555",
                        "1992-01-01",
                        "Prefer not to say",
                        "55 Pickup Road, Singapore",
                        "555H",
                        null,
                        "L",
                        "adult",
                        1)),
                0,
                null,
                true,
                null,
                null);
        String createJson = mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long registrationId = objectMapper.readTree(createJson).get("registrationId").asLong();
        mockMvc.perform(post("/api/registrations/{registrationId}/payment-attempts", registrationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PaymentSubmitRequest(
                                com.terryfoxrun.api.domain.PaymentMethod.PAYNOW,
                                "PAYNOW-LOOKUP",
                                null))))
                .andExpect(status().isOk());
        Long paymentAttemptId = paymentAttemptRepository.findAll().stream()
                .filter(attempt -> attempt.getRegistration().getId().equals(registrationId))
                .findFirst()
                .orElseThrow()
                .getId();
        mockMvc.perform(post("/api/admin/payment-attempts/{id}/confirm", paymentAttemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "adminTransactionId", "BANK-LOOKUP",
                                "verifiedBy", "admin@example.com"))))
                .andExpect(status().isOk());
        String pickupCode = participantRepository.findAll().stream()
                .filter(participant -> participant.getRegistration().getId().equals(registrationId))
                .findFirst()
                .orElseThrow()
                .getPickupCode();

        mockMvc.perform(post("/api/pickup/lookup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("tokenOrCode", pickupCode))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("READY_FOR_PICKUP"))
                .andExpect(jsonPath("$.pickupStatus").value("PENDING"));

        assertThat(participantRepository.findByPickupCode(pickupCode).orElseThrow().getPickupStatus()).isEqualTo("PENDING");

        mockMvc.perform(post("/api/pickup/collect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("tokenOrCode", pickupCode))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("COLLECTED"))
                .andExpect(jsonPath("$.pickupTimestamp").exists());

        mockMvc.perform(get("/api/pickup/history")
                        .param("eventId", eventId.toString())
                        .param("query", "Lookup"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].participantName").value("Lookup User"));
    }

    @Test
    void managesAnnouncementsCampaignsPackagesAndCategories() throws Exception {
        localEmailService.clear();
        Long eventId = eventRepository.findFirstByCurrentTrue().orElseThrow().getId();

        mockMvc.perform(post("/api/events/{eventId}/announcements", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "Pickup reminder",
                                "body", "Bring your confirmation code.",
                                "channelEmail", true,
                                "channelDashboard", true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Pickup reminder"));

        mockMvc.perform(get("/api/events/{eventId}/announcements", eventId)
                        .param("dashboardOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Pickup reminder"));

        mockMvc.perform(post("/api/events/{eventId}/email-campaigns", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "audience", "confirmed-participants",
                                "subject", "Terry Fox Run update",
                                "body", "See you at the run.",
                                "sendPreview", true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sentStatus").value("PREVIEW_CREATED"));
        assertThat(localEmailService.sentEmails()).extracting(email -> email.template()).contains("email-campaign-preview");

        String packageJson = mockMvc.perform(post("/api/events/{eventId}/corporate-packages", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "packageName", "Bronze",
                                "price", 50000,
                                "shirtAllocationRulesJson", "{\"adult\":{\"M\":10}}",
                                "active", true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.packageName").value("Bronze"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long packageId = objectMapper.readTree(packageJson).get("id").asLong();

        mockMvc.perform(get("/api/events/{eventId}/corporate-packages", eventId)
                        .param("activeOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].packageName").value("Bronze"));

        String categoryJson = mockMvc.perform(post("/api/events/{eventId}/categories", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Wheelchair 5K",
                                "description", "Accessible route",
                                "basePrice", 0,
                                "isActive", true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Wheelchair 5K"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long categoryId = objectMapper.readTree(categoryJson).get("id").asLong();

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/events/{eventId}/categories/{categoryId}", eventId, categoryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Accessible 5K",
                                "description", "Accessible route",
                                "basePrice", 0,
                                "isActive", true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Accessible 5K"));

        mockMvc.perform(delete("/api/events/{eventId}/corporate-packages/{packageId}", eventId, packageId))
                .andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/events/{eventId}/categories/{categoryId}", eventId, categoryId))
                .andExpect(status().isNoContent());
    }

    @Test
    void reportsEventStatsRegistrationsAndRolesFallback() throws Exception {
        Long eventId = eventRepository.findFirstByCurrentTrue().orElseThrow().getId();
        var event = eventRepository.findById(eventId).orElseThrow();
        Long categoryId = categoryRepository.findByEvent(event).get(0).getId();

        RegistrationCreateRequest pendingRequest = new RegistrationCreateRequest(
                eventId,
                "Stats Pending",
                "pending-stats@example.com",
                "S6666666I",
                "66 Stats Road, Singapore",
                "O-",
                List.of(new ParticipantInput(
                        categoryId,
                        "Pending Runner",
                        "pending-runner@example.com",
                        "81236666",
                        "Emergency Contact",
                        "87656666",
                        "1991-01-01",
                        "Prefer not to say",
                        "66 Stats Road, Singapore",
                        "666I",
                        null,
                        "S",
                        "adult",
                        1)),
                20_00,
                null,
                true,
                null,
                null);

        String pendingJson = mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pendingRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long pendingRegistrationId = objectMapper.readTree(pendingJson).get("registrationId").asLong();
        mockMvc.perform(post("/api/registrations/{registrationId}/payment-attempts", pendingRegistrationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PaymentSubmitRequest(
                                com.terryfoxrun.api.domain.PaymentMethod.BANK_TRANSFER,
                                "BANK-STATS-PENDING",
                                null))))
                .andExpect(status().isOk());

        RegistrationCreateRequest confirmedRequest = new RegistrationCreateRequest(
                eventId,
                "Stats Confirmed",
                "confirmed-stats@example.com",
                "S7777777J",
                "77 Stats Road, Singapore",
                "AB-",
                List.of(new ParticipantInput(
                        categoryId,
                        "Confirmed Runner",
                        "confirmed-runner@example.com",
                        "81237777",
                        "Emergency Contact",
                        "87657777",
                        "1991-01-01",
                        "Prefer not to say",
                        "77 Stats Road, Singapore",
                        "777J",
                        null,
                        "M",
                        "adult",
                        1)),
                30_00,
                null,
                true,
                null,
                null);

        String confirmedJson = mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(confirmedRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long confirmedRegistrationId = objectMapper.readTree(confirmedJson).get("registrationId").asLong();
        mockMvc.perform(post("/api/registrations/{registrationId}/payment-attempts", confirmedRegistrationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PaymentSubmitRequest(
                                com.terryfoxrun.api.domain.PaymentMethod.PAYNOW,
                                "PAYNOW-STATS-CONFIRMED",
                                null))))
                .andExpect(status().isOk());
        Long confirmedAttemptId = paymentAttemptRepository.findAll().stream()
                .filter(attempt -> attempt.getRegistration().getId().equals(confirmedRegistrationId))
                .findFirst()
                .orElseThrow()
                .getId();
        mockMvc.perform(post("/api/admin/payment-attempts/{id}/confirm", confirmedAttemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "adminTransactionId", "BANK-STATS-CONFIRMED",
                                "verifiedBy", "admin@example.com"))))
                .andExpect(status().isOk());

        String pickupCode = participantRepository.findAll().stream()
                .filter(participant -> participant.getRegistration().getId().equals(confirmedRegistrationId))
                .findFirst()
                .orElseThrow()
                .getPickupCode();

        mockMvc.perform(get("/api/events/{eventId}/stats", eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.confirmedAmount").value(org.hamcrest.Matchers.greaterThanOrEqualTo(6500)))
                .andExpect(jsonPath("$.pendingAmount").value(org.hamcrest.Matchers.greaterThanOrEqualTo(5500)))
                .andExpect(jsonPath("$.confirmedPaymentCount").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.pendingPaymentCount").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.dailyAmounts[0].cumulativeConfirmedAmount").exists());

        mockMvc.perform(get("/api/events/{eventId}/registrations", eventId)
                        .param("query", pickupCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.counts.total").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.counts.confirmed").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.counts.pendingPayment").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.dailyRegistrations[0].count").exists())
                .andExpect(jsonPath("$.registrations", hasSize(1)))
                .andExpect(jsonPath("$.registrations[0].payerEmail").value("confirmed-stats@example.com"))
                .andExpect(jsonPath("$.registrations[0].shirtSummary").value(org.hamcrest.Matchers.containsString("1 x adult M")));

        mockMvc.perform(get("/api/admin/roles/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.configured").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("SUPABASE")));
    }
}
