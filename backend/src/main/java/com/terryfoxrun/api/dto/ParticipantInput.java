package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ParticipantInput(
        @NotNull Long categoryId,
        @NotBlank String name,
        @Email String email,
        @NotBlank String phone,
        @NotBlank String emergencyContactName,
        @NotBlank String emergencyContactPhone,
        @NotBlank String dob, // ISO date as string for now
        @NotBlank String gender,
        @NotBlank String address,
        @NotBlank String nricLast4,
        String medicalNotes,
        String tshirtSize,
        String tshirtType,
        Integer tshirtQty
) {
}

