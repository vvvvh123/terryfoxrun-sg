package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.Registration;
import com.terryfoxrun.api.domain.RegistrationParticipant;
import com.terryfoxrun.api.domain.RegistrationShirt;
import com.terryfoxrun.api.dto.AdminRegistrationReportDto;
import com.terryfoxrun.api.dto.EventStatsDto;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.RegistrationParticipantRepository;
import com.terryfoxrun.api.repo.RegistrationRepository;
import com.terryfoxrun.api.repo.RegistrationShirtRepository;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminReportService {
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final RegistrationParticipantRepository participantRepository;
    private final RegistrationShirtRepository shirtRepository;

    public AdminReportService(EventRepository eventRepository,
                              RegistrationRepository registrationRepository,
                              RegistrationParticipantRepository participantRepository,
                              RegistrationShirtRepository shirtRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.participantRepository = participantRepository;
        this.shirtRepository = shirtRepository;
    }

    @Transactional(readOnly = true)
    public EventStatsDto stats(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        List<Registration> registrations = registrationRepository.findByEvent(event);
        int confirmedAmount = sumByPaymentStatus(registrations, "CONFIRMED");
        int pendingAmount = sumByPaymentStatus(registrations, "PENDING_ADMIN_VERIFICATION");
        int confirmedCount = (int) registrations.stream().filter(registration -> "CONFIRMED".equals(registration.getPaymentStatus())).count();
        int pendingCount = (int) registrations.stream().filter(registration -> "PENDING_ADMIN_VERIFICATION".equals(registration.getPaymentStatus())).count();

        Map<LocalDate, DailyAccumulator> daily = new LinkedHashMap<>();
        registrations.stream()
                .filter(registration -> registration.getCreatedAt() != null)
                .sorted(Comparator.comparing(Registration::getCreatedAt))
                .forEach(registration -> {
                    LocalDate date = registration.getCreatedAt().toLocalDate();
                    DailyAccumulator accumulator = daily.computeIfAbsent(date, ignored -> new DailyAccumulator());
                    if ("CONFIRMED".equals(registration.getPaymentStatus())) {
                        accumulator.confirmed += amount(registration);
                    } else if ("PENDING_ADMIN_VERIFICATION".equals(registration.getPaymentStatus())) {
                        accumulator.pending += amount(registration);
                    }
                });

        List<EventStatsDto.DailyAmountDto> dailyAmounts = new ArrayList<>();
        int cumulativeConfirmed = 0;
        int cumulativePending = 0;
        for (Map.Entry<LocalDate, DailyAccumulator> entry : daily.entrySet()) {
            cumulativeConfirmed += entry.getValue().confirmed;
            cumulativePending += entry.getValue().pending;
            dailyAmounts.add(new EventStatsDto.DailyAmountDto(
                    entry.getKey().toString(),
                    entry.getValue().confirmed,
                    entry.getValue().pending,
                    cumulativeConfirmed,
                    cumulativePending));
        }

        return new EventStatsDto(confirmedAmount, pendingAmount, confirmedCount, pendingCount, dailyAmounts);
    }

    @Transactional(readOnly = true)
    public AdminRegistrationReportDto registrations(Long eventId, String query, String paymentStatus, String status) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        List<Registration> registrations = registrationRepository.findByEvent(event);
        List<RegistrationParticipant> participants = registrations.isEmpty() ? List.of() : participantRepository.findByRegistrationIn(registrations);
        Map<Long, List<RegistrationParticipant>> participantsByRegistration = participants.stream()
                .collect(Collectors.groupingBy(participant -> participant.getRegistration().getId()));

        String normalizedQuery = normalize(query);
        List<Registration> filtered = registrations.stream()
                .filter(registration -> paymentStatus == null || paymentStatus.isBlank() || paymentStatus.equals(registration.getPaymentStatus()))
                .filter(registration -> status == null || status.isBlank() || status.equals(registration.getStatus()))
                .filter(registration -> matches(registration, participantsByRegistration.getOrDefault(registration.getId(), List.of()), normalizedQuery))
                .sorted(Comparator.comparing(Registration::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();

        AdminRegistrationReportDto.RegistrationCounts counts = new AdminRegistrationReportDto.RegistrationCounts(
                registrations.size(),
                registrations.stream().filter(registration -> "CONFIRMED".equals(registration.getPaymentStatus())).count(),
                registrations.stream().filter(registration -> "PENDING_ADMIN_VERIFICATION".equals(registration.getPaymentStatus())).count(),
                registrations.stream().filter(registration -> "PAYMENT_REJECTED".equals(registration.getPaymentStatus())).count());

        List<AdminRegistrationReportDto.DailyRegistrationCountDto> dailyRegistrations = registrations.stream()
                .filter(registration -> registration.getCreatedAt() != null)
                .collect(Collectors.groupingBy(registration -> registration.getCreatedAt().toLocalDate(), LinkedHashMap::new, Collectors.counting()))
                .entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new AdminRegistrationReportDto.DailyRegistrationCountDto(entry.getKey().toString(), entry.getValue()))
                .toList();

        List<AdminRegistrationReportDto.RegistrationRowDto> rows = filtered.stream()
                .map(registration -> new AdminRegistrationReportDto.RegistrationRowDto(
                        registration.getId(),
                        registration.getPayerName(),
                        registration.getPayerEmail(),
                        registration.getGeneratedPaymentReference(),
                        registration.getStatus(),
                        registration.getPaymentStatus(),
                        registration.getTotalAmount(),
                        registration.getCreatedAt() == null ? null : registration.getCreatedAt().toInstant(ZoneOffset.UTC),
                        participantsByRegistration.getOrDefault(registration.getId(), List.of()).size(),
                        shirtSummary(registration)))
                .toList();

        return new AdminRegistrationReportDto(counts, dailyRegistrations, rows);
    }

    private int sumByPaymentStatus(List<Registration> registrations, String paymentStatus) {
        return registrations.stream()
                .filter(registration -> paymentStatus.equals(registration.getPaymentStatus()))
                .mapToInt(this::amount)
                .sum();
    }

    private int amount(Registration registration) {
        return Objects.requireNonNullElse(registration.getTotalAmount(), 0);
    }

    private boolean matches(Registration registration, List<RegistrationParticipant> participants, String query) {
        if (query == null || query.isBlank()) {
            return true;
        }
        if (contains(registration.getPayerName(), query)
                || contains(registration.getPayerEmail(), query)
                || contains(registration.getGeneratedPaymentReference(), query)) {
            return true;
        }
        return participants.stream().anyMatch(participant ->
                contains(participant.getName(), query)
                        || contains(participant.getEmail(), query)
                        || contains(participant.getPickupCode(), query));
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private String shirtSummary(Registration registration) {
        List<RegistrationShirt> shirts = shirtRepository.findByRegistration(registration);
        if (shirts.isEmpty()) {
            return "No shirts";
        }
        Map<String, Integer> summary = new LinkedHashMap<>();
        for (RegistrationShirt shirt : shirts) {
            if (shirt.getQuantity() == null || shirt.getQuantity() <= 0) continue;
            summary.merge(shirt.getType() + " " + shirt.getSize(), shirt.getQuantity(), Integer::sum);
        }
        if (summary.isEmpty()) {
            return "No shirts";
        }
        return summary.entrySet().stream()
                .map(entry -> entry.getValue() + " x " + entry.getKey())
                .collect(Collectors.joining(", "));
    }

    private static final class DailyAccumulator {
        private int confirmed;
        private int pending;
    }
}
