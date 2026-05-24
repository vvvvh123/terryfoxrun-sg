package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.RegistrationParticipant;
import com.terryfoxrun.api.domain.RegistrationShirt;
import com.terryfoxrun.api.dto.PickupResultDto;
import com.terryfoxrun.api.dto.PickupSummaryDto;
import com.terryfoxrun.api.dto.RegistrationQuoteRequest;
import com.terryfoxrun.api.repo.RegistrationParticipantRepository;
import com.terryfoxrun.api.repo.RegistrationShirtRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class PickupService {

    private final RegistrationParticipantRepository participantRepository;
    private final RegistrationShirtRepository registrationShirtRepository;

    public PickupService(RegistrationParticipantRepository participantRepository,
                         RegistrationShirtRepository registrationShirtRepository) {
        this.participantRepository = participantRepository;
        this.registrationShirtRepository = registrationShirtRepository;
    }

    @Transactional
    public Optional<RegistrationParticipant> markCollected(String tokenOrCode) {
        return collect(tokenOrCode, null).filter(result -> "COLLECTED".equals(result.result()))
                .flatMap(result -> participantRepository.findById(result.participantId()));
    }

    @Transactional
    public Optional<PickupResultDto> scan(String tokenOrCode, String collectedBy) {
        return collect(tokenOrCode, collectedBy);
    }

    @Transactional(readOnly = true)
    public Optional<PickupResultDto> lookup(String tokenOrCode) {
        return findByTokenOrCode(tokenOrCode).map(participant -> {
            if (!"CONFIRMED".equals(participant.getRegistration().getPaymentStatus())) {
                return toResult("PAYMENT_NOT_CONFIRMED", "Payment is not confirmed yet.", participant);
            }
            if (isCollected(participant)) {
                return toResult("ALREADY_COLLECTED", "This pickup code was already collected.", participant);
            }
            return toResult("READY_FOR_PICKUP", "Payment confirmed. Confirm collection when the shirts are handed over.", participant);
        });
    }

    @Transactional
    public Optional<PickupResultDto> collect(String tokenOrCode, String collectedBy) {
        Optional<RegistrationParticipant> participant = findByTokenOrCode(tokenOrCode);
        if (participant.isEmpty()) {
            return Optional.empty();
        }

        RegistrationParticipant p = participant.get();
        if (!"CONFIRMED".equals(p.getRegistration().getPaymentStatus())) {
            return Optional.of(toResult("PAYMENT_NOT_CONFIRMED", "Payment is not confirmed yet.", p));
        }
        if (isCollected(p)) {
            return Optional.of(toResult("ALREADY_COLLECTED", "This pickup code was already collected.", p));
        }

        p.setPickupStatus("COLLECTED");
        p.setPickupTimestamp(LocalDateTime.now());
        p.setPickupCollectedBy(collectedBy);
        participantRepository.save(p);
        return Optional.of(toResult("COLLECTED", "Pickup marked as collected.", p));
    }

    @Transactional(readOnly = true)
    public List<PickupResultDto> history(Long eventId, String query, String status) {
        String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        String normalizedStatus = status == null ? "" : status.trim();
        return participantRepository.findByRegistration_Event_Id(eventId).stream()
                .filter(participant -> normalizedStatus.isBlank() || normalizedStatus.equalsIgnoreCase(participant.getPickupStatus()))
                .filter(participant -> normalizedQuery.isBlank()
                        || (participant.getPickupCode() != null && participant.getPickupCode().toLowerCase(Locale.ROOT).contains(normalizedQuery))
                        || (participant.getName() != null && participant.getName().toLowerCase(Locale.ROOT).contains(normalizedQuery)))
                .map(participant -> toResult(historyResult(participant), "Pickup history item.", participant))
                .toList();
    }

    private Optional<RegistrationParticipant> findByTokenOrCode(String tokenOrCode) {
        Optional<RegistrationParticipant> participant = participantRepository.findByPickupToken(tokenOrCode);
        if (participant.isEmpty()) {
            participant = participantRepository.findByPickupCode(tokenOrCode);
        }
        return participant;
    }

    @Transactional(readOnly = true)
    public PickupSummaryDto summary(Long eventId) {
        List<RegistrationParticipant> participants = participantRepository.findByRegistration_Event_Id(eventId);
        long collected = participants.stream().filter(this::isCollected).count();
        long pending = participants.size() - collected;
        return new PickupSummaryDto(
                collected,
                pending,
                participants.stream()
                        .filter(this::isCollected)
                        .map(participant -> new PickupSummaryDto.Item(
                                participant.getId(),
                                participant.getRegistration().getId(),
                                participant.getName(),
                                participant.getPickupCode(),
                                participant.getTshirtSize(),
                                participant.getTshirtType(),
                                participant.getTshirtQty(),
                                participant.getPickupTimestamp() == null ? null : participant.getPickupTimestamp().toInstant(ZoneOffset.UTC)))
                        .toList());
    }

    private boolean isCollected(RegistrationParticipant participant) {
        return "COLLECTED".equalsIgnoreCase(participant.getPickupStatus()) || "collected".equalsIgnoreCase(participant.getPickupStatus());
    }

    private String historyResult(RegistrationParticipant participant) {
        if (!"CONFIRMED".equals(participant.getRegistration().getPaymentStatus())) return "PAYMENT_NOT_CONFIRMED";
        if (isCollected(participant)) return "ALREADY_COLLECTED";
        return "READY_FOR_PICKUP";
    }

    private PickupResultDto toResult(String result, String message, RegistrationParticipant participant) {
        List<RegistrationQuoteRequest.ShirtOrderDto> shirtOrders = registrationShirtRepository.findByParticipant(participant).stream()
                .map(this::toShirtOrder)
                .toList();
        if (shirtOrders.isEmpty() && participant.getTshirtSize() != null && participant.getTshirtQty() != null && participant.getTshirtQty() > 0) {
            shirtOrders = List.of(new RegistrationQuoteRequest.ShirtOrderDto(participant.getTshirtSize(), participant.getTshirtType(), participant.getTshirtQty()));
        }
        return new PickupResultDto(
                result,
                message,
                participant.getRegistration().getId(),
                participant.getRegistration().getPayerName(),
                participant.getRegistration().getPayerEmail(),
                participant.getRegistration().getPaymentStatus(),
                participant.getRegistration().getTotalAmount(),
                participant.getId(),
                participant.getName(),
                participant.getCategory() == null ? null : participant.getCategory().getName(),
                participant.getTshirtSize(),
                participant.getTshirtType(),
                participant.getTshirtQty(),
                shirtOrders,
                participant.getPickupCode(),
                participant.getPickupStatus(),
                participant.getPickupTimestamp() == null ? null : participant.getPickupTimestamp().toInstant(ZoneOffset.UTC),
                participant.getPickupCollectedBy());
    }

    private RegistrationQuoteRequest.ShirtOrderDto toShirtOrder(RegistrationShirt shirt) {
        return new RegistrationQuoteRequest.ShirtOrderDto(shirt.getSize(), shirt.getType(), shirt.getQuantity());
    }
}
