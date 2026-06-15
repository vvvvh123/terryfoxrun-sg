package com.terryfoxrun.api.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.terryfoxrun.api.domain.Registration;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.RegistrationRepository;
import java.time.LocalDateTime;
import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "app.security.enabled=true")
@ActiveProfiles("test")
@AutoConfigureMockMvc
class SecurityConfigIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Test
    void allowsFrontendDevelopmentCorsPreflight() throws Exception {
        mockMvc.perform(options("/api/events/current")
                        .header("Origin", "http://127.0.0.1:3000")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://127.0.0.1:3000"));
    }

    @Test
    void mapsSupabaseAppMetadataRoleToSpringSecurityRole() {
        SecurityConfig config = new SecurityConfig();
        JwtAuthenticationConverter converter = (JwtAuthenticationConverter) ReflectionTestUtils.invokeMethod(config, "jwtAuthenticationConverter");
        Jwt jwt = new Jwt(
                "token",
                Instant.now(),
                Instant.now().plusSeconds(60),
                Map.of("alg", "ES256"),
                Map.of(
                        "sub", "c56d2ed5-8a58-4e49-a425-4df634188e5c",
                        "email", "harlanivikas@gmail.com",
                        "app_metadata", Map.of("app_role", "admin")
                )
        );

        assertThat(converter.convert(jwt).getAuthorities())
                .extracting("authority")
                .contains("ROLE_ADMIN");
    }

    @Test
    void allowsPublicCorporateOrderSubmitButProtectsAdminCorporateOrderReads() throws Exception {
        Long eventId = eventRepository.findFirstByCurrentTrue().orElseThrow().getId();

        mockMvc.perform(post("/api/corporate-orders")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(Map.of(
                                "eventId", eventId,
                                "companyName", "Public Co",
                                "companyAddress", "1 Public Road",
                                "uen", "202600001Z",
                                "contactName", "Public Contact",
                                "contactEmail", "public@example.com",
                                "contactPhone", "81234567",
                                "items", java.util.List.of(Map.of("size", "M", "type", "adult", "quantity", 1))))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/corporate-orders").param("eventId", eventId.toString()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registrationDetailsAreVisibleOnlyToOwnerOrAdmin() throws Exception {
        Long eventId = eventRepository.findFirstByCurrentTrue().orElseThrow().getId();
        Long registrationId = createRegistration(eventId, "owner-user", "owner@example.com");

        mockMvc.perform(get("/api/registrations/{registrationId}", registrationId)
                        .header("Authorization", "Bearer owner-token"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/registrations/{registrationId}", registrationId)
                        .header("Authorization", "Bearer other-token"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/registrations/{registrationId}", registrationId)
                        .header("Authorization", "Bearer admin-token"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/registrations/{registrationId}", 999999L)
                        .header("Authorization", "Bearer owner-token"))
                .andExpect(status().isNotFound());
    }

    private Long createRegistration(Long eventId, String payerUserId, String payerEmail) {
        Registration registration = new Registration();
        registration.setEvent(eventRepository.findById(eventId).orElseThrow());
        registration.setPayerUserId(payerUserId);
        registration.setPayerName("Owner User");
        registration.setPayerEmail(payerEmail);
        registration.setPayerIdentityNumber("S1234567A");
        registration.setPayerAddress("1 Owner Road");
        registration.setPayerBloodType("O+");
        registration.setTotalAmount(0);
        registration.setStatus("CONFIRMED");
        registration.setPaymentStatus("CONFIRMED");
        registration.setGeneratedPaymentReference("TFR2025-SEC" + System.nanoTime());
        registration.setIndemnityAccepted(true);
        registration.setCreatedAt(LocalDateTime.now());
        return registrationRepository.save(registration).getId();
    }

    @TestConfiguration
    static class JwtTestConfiguration {
        @Bean
        JwtDecoder jwtDecoder() {
            return token -> {
                String subject = switch (token) {
                    case "owner-token" -> "owner-user";
                    case "other-token" -> "other-user";
                    case "admin-token" -> "admin-user";
                    default -> "unknown-user";
                };
                String role = "admin-token".equals(token) ? "admin" : "participant";
                return new Jwt(
                        token,
                        Instant.now(),
                        Instant.now().plusSeconds(60),
                        Map.of("alg", "none"),
                        Map.of(
                                "sub", subject,
                                "app_metadata", Map.of("app_role", role)
                        )
                );
            };
        }
    }
}
