package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

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
        Integer tshirtQty,
        List<RegistrationQuoteRequest.ShirtOrderDto> shirtOrders
) {
    public ParticipantInput(
            Long categoryId,
            String name,
            String email,
            String phone,
            String emergencyContactName,
            String emergencyContactPhone,
            String dob,
            String gender,
            String address,
            String nricLast4,
            String medicalNotes,
            String tshirtSize,
            String tshirtType,
            Integer tshirtQty) {
        this(categoryId, name, email, phone, emergencyContactName, emergencyContactPhone, dob, gender, address, nricLast4, medicalNotes, tshirtSize, tshirtType, tshirtQty, null);
    }
}
