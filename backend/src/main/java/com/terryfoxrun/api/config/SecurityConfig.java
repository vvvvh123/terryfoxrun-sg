package com.terryfoxrun.api.config;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000}")
    private List<String> allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        if (!securityEnabled) {
            http.cors(cors -> {})
                    .csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }

        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/api/events/current", "/api/events/*", "/api/events/*/categories").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/events/*/slideshow", "/api/events/*/form-fields").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/events/*/contact-submissions").permitAll()
                        .requestMatchers("/api/registrations/quote").permitAll()
                        .requestMatchers("/api/registrations/me").hasAnyRole("PARTICIPANT", "ADMIN")
                        .requestMatchers("/api/pickup/**").hasAnyRole("VOLUNTEER", "ADMIN")
                        .requestMatchers("/api/admin/**", "/api/events/**", "/api/categories/**", "/api/corporate-orders/**", "/api/announcements/**", "/api/exports/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = "participant";
            Object appMetadata = jwt.getClaims().get("app_metadata");
            if (appMetadata instanceof Map<?, ?> metadata && metadata.get("app_role") instanceof String appRole && !appRole.isBlank()) {
                role = appRole;
            }
            return Stream.<GrantedAuthority>of(new SimpleGrantedAuthority("ROLE_" + role.trim().toUpperCase())).toList();
        });
        converter.setPrincipalClaimName("sub");
        return converter;
    }
}
