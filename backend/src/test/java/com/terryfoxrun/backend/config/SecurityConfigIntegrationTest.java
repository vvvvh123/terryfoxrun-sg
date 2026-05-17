package com.terryfoxrun.api.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class SecurityConfigIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

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
}
