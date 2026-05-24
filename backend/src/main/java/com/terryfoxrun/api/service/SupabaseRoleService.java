package com.terryfoxrun.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.terryfoxrun.api.dto.AdminRoleUsersDto;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SupabaseRoleService {
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String supabaseUrl;
    private final String serviceRoleKey;
    private final String secretKey;

    public SupabaseRoleService(ObjectMapper objectMapper,
                               @Value("${app.supabase.url:}") String supabaseUrl,
                               @Value("${app.supabase.service-role-key:}") String serviceRoleKey,
                               @Value("${app.supabase.secret-key:}") String secretKey) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
        this.supabaseUrl = supabaseUrl;
        this.serviceRoleKey = serviceRoleKey;
        this.secretKey = secretKey;
    }

    public AdminRoleUsersDto listUsers() {
        String key = !blank(secretKey) ? secretKey : serviceRoleKey;
        if (blank(supabaseUrl) || blank(key)) {
            return new AdminRoleUsersDto(
                    List.of(),
                    new AdminRoleUsersDto.RoleCounts(0, 0, 0),
                    false,
                    "Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY on the backend to list Supabase Auth users.");
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(trimTrailingSlash(supabaseUrl) + "/auth/v1/admin/users?page=1&per_page=1000"))
                    .header("apikey", key)
                    .header("Authorization", "Bearer " + key)
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return unavailable("Supabase user listing failed with status " + response.statusCode() + ".");
            }
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode usersNode = root.has("users") ? root.get("users") : root;
            List<AdminRoleUsersDto.RoleUserDto> users = new ArrayList<>();
            if (usersNode != null && usersNode.isArray()) {
                for (JsonNode node : usersNode) {
                    String role = node.path("app_metadata").path("app_role").asText("participant");
                    if (blank(role)) {
                        role = "participant";
                    }
                    users.add(new AdminRoleUsersDto.RoleUserDto(
                            node.path("id").asText(""),
                            node.path("email").asText(""),
                            role,
                            instant(node.path("created_at").asText(null)),
                            instant(node.path("last_sign_in_at").asText(null))));
                }
            }
            return new AdminRoleUsersDto(users, counts(users), true, "Supabase roles loaded.");
        } catch (Exception exception) {
            return unavailable("Supabase user listing is unavailable: " + exception.getMessage());
        }
    }

    private AdminRoleUsersDto unavailable(String message) {
        return new AdminRoleUsersDto(List.of(), new AdminRoleUsersDto.RoleCounts(0, 0, 0), false, message);
    }

    private AdminRoleUsersDto.RoleCounts counts(List<AdminRoleUsersDto.RoleUserDto> users) {
        long admin = users.stream().filter(user -> "admin".equalsIgnoreCase(user.appRole())).count();
        long volunteer = users.stream().filter(user -> "volunteer".equalsIgnoreCase(user.appRole())).count();
        long participant = users.size() - admin - volunteer;
        return new AdminRoleUsersDto.RoleCounts(admin, volunteer, participant);
    }

    private Instant instant(String value) {
        if (blank(value)) {
            return null;
        }
        return Instant.parse(value);
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private String trimTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
