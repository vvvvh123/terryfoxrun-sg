package com.terryfoxrun.api.dto;

import java.time.Instant;
import java.util.List;

public record AdminRoleUsersDto(
        List<RoleUserDto> users,
        RoleCounts counts,
        boolean configured,
        String message
) {
    public record RoleUserDto(
            String id,
            String email,
            String appRole,
            Instant createdAt,
            Instant lastSignInAt
    ) {
    }

    public record RoleCounts(
            long admin,
            long volunteer,
            long participant
    ) {
    }
}
