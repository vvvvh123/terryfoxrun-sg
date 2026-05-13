package com.terryfoxrun.api.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.terryfoxrun.api.domain.EventFormFieldConfig;
import com.terryfoxrun.api.domain.EventSlideshowImage;
import com.terryfoxrun.api.domain.PaymentAttempt;
import com.terryfoxrun.api.dto.ParticipantInput;
import com.terryfoxrun.api.dto.PaymentSubmitRequest;
import com.terryfoxrun.api.dto.RegistrationCreateRequest;
import com.terryfoxrun.api.repo.EventFormFieldConfigRepository;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.EventSlideshowImageRepository;
import com.terryfoxrun.api.repo.PaymentAttemptRepository;
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
                .andExpect(jsonPath("$.participants", hasSize(1)))
                .andExpect(jsonPath("$.paymentAttempts[0].verificationStatus").value("PENDING_ADMIN_VERIFICATION"));

        mockMvc.perform(get("/api/admin/payment-attempts").param("status", "PENDING_ADMIN_VERIFICATION"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].registrationId").value(registrationId));

        PaymentAttempt attempt = paymentAttemptRepository.findAll().get(0);
        assertThat(attempt.getUserTransactionId()).isEqualTo("PAYNOW-123");
    }
}
