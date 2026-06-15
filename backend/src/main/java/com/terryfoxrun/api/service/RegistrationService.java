package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.Category;
import com.terryfoxrun.api.domain.Donation;
import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.InventoryMovement;
import com.terryfoxrun.api.domain.Payment;
import com.terryfoxrun.api.domain.Registration;
import com.terryfoxrun.api.domain.RegistrationParticipant;
import com.terryfoxrun.api.domain.RegistrationShirt;
import com.terryfoxrun.api.domain.ShirtInventory;
import com.terryfoxrun.api.dto.ParticipantInput;
import com.terryfoxrun.api.dto.PaymentAttemptDto;
import com.terryfoxrun.api.dto.RegistrationCreateRequest;
import com.terryfoxrun.api.dto.RegistrationCreateResponse;
import com.terryfoxrun.api.dto.RegistrationDetailDto;
import com.terryfoxrun.api.dto.RegistrationQuoteRequest;
import com.terryfoxrun.api.dto.RegistrationQuoteResponse;
import com.terryfoxrun.api.repo.CategoryRepository;
import com.terryfoxrun.api.repo.DonationRepository;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.InventoryMovementRepository;
import com.terryfoxrun.api.repo.PaymentAttemptRepository;
import com.terryfoxrun.api.repo.PaymentRepository;
import com.terryfoxrun.api.repo.RegistrationParticipantRepository;
import com.terryfoxrun.api.repo.RegistrationRepository;
import com.terryfoxrun.api.repo.RegistrationShirtRepository;
import com.terryfoxrun.api.repo.ShirtInventoryRepository;
import com.terryfoxrun.api.service.email.EmailService;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RegistrationService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final RegistrationRepository registrationRepository;
    private final RegistrationParticipantRepository participantRepository;
    private final DonationRepository donationRepository;
    private final ShirtInventoryRepository shirtInventoryRepository;
    private final RegistrationShirtRepository registrationShirtRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final EmailService emailService;

    public RegistrationService(EventRepository eventRepository,
                               CategoryRepository categoryRepository,
                               RegistrationRepository registrationRepository,
                               RegistrationParticipantRepository participantRepository,
                               DonationRepository donationRepository,
                               ShirtInventoryRepository shirtInventoryRepository,
                               RegistrationShirtRepository registrationShirtRepository,
                               PaymentAttemptRepository paymentAttemptRepository,
                               PaymentRepository paymentRepository,
                               InventoryMovementRepository inventoryMovementRepository,
                               EmailService emailService) {
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
        this.registrationRepository = registrationRepository;
        this.participantRepository = participantRepository;
        this.donationRepository = donationRepository;
        this.shirtInventoryRepository = shirtInventoryRepository;
        this.registrationShirtRepository = registrationShirtRepository;
        this.paymentAttemptRepository = paymentAttemptRepository;
        this.paymentRepository = paymentRepository;
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public RegistrationQuoteResponse quote(RegistrationQuoteRequest request) {
        Event event = eventRepository.findById(request.eventId()).orElseThrow();
        int shirtPrice = Optional.ofNullable(event.getShirtPrice()).orElse(0);
        Map<String, Integer> requestedBySize = requestedShirts(request.participants(), request.extraShirts());
        int shirtsTotal = requestedBySize.values().stream().mapToInt(quantity -> quantity * shirtPrice).sum();
        int donation = Optional.ofNullable(request.donationAmount()).orElse(0);
        List<String> warnings = inventoryWarnings(event, requestedBySize);
        return new RegistrationQuoteResponse(shirtsTotal, shirtsTotal, donation, shirtsTotal + donation, warnings);
    }

    @Transactional
    public Registration create(String payerUserId, RegistrationCreateRequest request) {
        if (!request.indemnityAccepted()) {
            throw new IllegalArgumentException("Indemnity agreement is required before checkout.");
        }

        Event event = eventRepository.findById(request.eventId()).orElseThrow();
        RegistrationQuoteResponse quote = quote(new RegistrationQuoteRequest(
                request.eventId(),
                request.participants(),
                request.donationAmount(),
                request.extraShirts()
        ));
        if (!quote.inventoryWarnings().isEmpty()) {
            throw new IllegalStateException("Inventory not sufficient: " + quote.inventoryWarnings());
        }

        Registration registration = new Registration();
        registration.setEvent(event);
        registration.setPayerUserId(payerUserId);
        registration.setPayerName(request.payerName());
        registration.setPayerEmail(request.payerEmail());
        registration.setPayerIdentityNumber(request.payerIdentityNumber());
        registration.setPayerAddress(request.payerAddress());
        registration.setPayerBloodType(request.payerBloodType());
        registration.setTotalAmount(quote.grandTotal());
        registration.setStatus("CHECKOUT_PENDING");
        registration.setPaymentStatus("UNPAID");
        registration.setGeneratedPaymentReference(generatePaymentReference(event));
        registration.setIndemnityAccepted(true);
        registration.setCreatedAt(LocalDateTime.now());
        registrationRepository.save(registration);

        for (ParticipantInput participant : request.participants()) {
            RegistrationParticipant entity = new RegistrationParticipant();
            entity.setRegistration(registration);
            Category category = categoryRepository.findById(participant.categoryId()).orElseThrow();
            entity.setCategory(category);
            entity.setName(participant.name());
            entity.setEmail(participant.email());
            entity.setPhone(participant.phone());
            entity.setEmergencyContactName(participant.emergencyContactName());
            entity.setEmergencyContactPhone(participant.emergencyContactPhone());
            entity.setDob(participant.dob());
            entity.setGender(participant.gender());
            entity.setAddress(participant.address());
            entity.setNricLast4(participant.nricLast4());
            entity.setMedicalNotes(participant.medicalNotes());
            List<RegistrationQuoteRequest.ShirtOrderDto> shirtOrders = participantShirtOrders(participant);
            RegistrationQuoteRequest.ShirtOrderDto firstShirt = shirtOrders.stream()
                    .filter(order -> order.quantity() != null && order.quantity() > 0)
                    .findFirst()
                    .orElse(null);
            entity.setTshirtSize(firstShirt == null ? participant.tshirtSize() : firstShirt.size());
            entity.setTshirtType(firstShirt == null ? participant.tshirtType() : firstShirt.type());
            entity.setTshirtQty(firstShirt == null ? Optional.ofNullable(participant.tshirtQty()).orElse(0) : firstShirt.quantity());
            entity.setPickupToken(UUID.randomUUID().toString());
            entity.setPickupCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            entity.setPickupStatus("PENDING");
            registration.getParticipants().add(entity);
            participantRepository.save(entity);
            for (RegistrationQuoteRequest.ShirtOrderDto shirtOrder : shirtOrders) {
                if (shirtOrder.quantity() == null || shirtOrder.quantity() <= 0) continue;
                RegistrationShirt shirt = new RegistrationShirt();
                shirt.setRegistration(registration);
                shirt.setParticipant(entity);
                shirt.setType(shirtOrder.type());
                shirt.setSize(shirtOrder.size());
                shirt.setQuantity(shirtOrder.quantity());
                shirt.setSource("participant");
                registrationShirtRepository.save(shirt);
            }
        }

        if (request.extraShirts() != null) {
            for (RegistrationQuoteRequest.ShirtOrderDto extra : request.extraShirts()) {
                RegistrationShirt shirt = new RegistrationShirt();
                shirt.setRegistration(registration);
                shirt.setType(extra.type());
                shirt.setSize(extra.size());
                shirt.setQuantity(extra.quantity());
                shirt.setSource("extra");
                registrationShirtRepository.save(shirt);
            }
        }

        if (request.donationAmount() != null && request.donationAmount() > 0) {
            Donation donation = new Donation();
            donation.setRegistration(registration);
            donation.setAmount(request.donationAmount());
            registration.getDonations().add(donation);
            donationRepository.save(donation);
        }

        if (registration.getTotalAmount() != null && registration.getTotalAmount() == 0) {
            confirmNoPaymentRequired(registration);
        }

        return registration;
    }

    public RegistrationCreateResponse toCreateResponse(Registration registration) {
        return new RegistrationCreateResponse(
                registration.getId(),
                registration.getGeneratedPaymentReference(),
                registration.getTotalAmount(),
                registration.getStatus(),
                registration.getPaymentStatus());
    }

    @Transactional(readOnly = true)
    public List<Registration> getMyRegistrations(String payerUserId) {
        return registrationRepository.findByPayerUserId(payerUserId);
    }

    @Transactional(readOnly = true)
    public Optional<Registration> getRegistration(Long id) {
        return registrationRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<RegistrationDetailDto> getRegistrationDetail(Long id) {
        return registrationRepository.findById(id).map(this::toDetailDto);
    }

    @Transactional(readOnly = true)
    public Optional<RegistrationDetailDto> getRegistrationDetailForUser(Long id, String payerUserId, boolean admin) {
        Optional<Registration> registration = registrationRepository.findById(id);
        if (registration.isEmpty()) {
            return Optional.empty();
        }
        if (!admin && !Objects.equals(registration.get().getPayerUserId(), payerUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Registration belongs to another user.");
        }
        return registration.map(this::toDetailDto);
    }

    @Transactional(readOnly = true)
    public List<RegistrationDetailDto> getMyRegistrationDetails(String payerUserId) {
        return registrationRepository.findByPayerUserId(payerUserId).stream()
                .map(this::toDetailDto)
                .toList();
    }

    private RegistrationDetailDto toDetailDto(Registration registration) {
        List<RegistrationDetailDto.ParticipantDto> participants = participantRepository.findByRegistration(registration).stream()
                .map(participant -> new RegistrationDetailDto.ParticipantDto(
                        participant.getId(),
                        participant.getCategory() == null ? null : participant.getCategory().getId(),
                        participant.getCategory() == null ? null : participant.getCategory().getName(),
                        participant.getName(),
                        participant.getEmail(),
                        participant.getPhone(),
                        participant.getAddress(),
                        participant.getNricLast4(),
                        participant.getMedicalNotes(),
                        participant.getTshirtSize(),
                        participant.getTshirtType(),
                        participant.getTshirtQty(),
                        participantShirtDtos(participant),
                        participant.getPickupCode(),
                        participant.getPickupStatus()))
                .toList();
        List<PaymentAttemptDto> attempts = paymentAttemptRepository.findByRegistrationOrderBySubmittedAtDesc(registration).stream()
                .map(attempt -> new PaymentAttemptDto(
                        attempt.getId(),
                        registration.getId(),
                        attempt.getMethod(),
                        attempt.getGeneratedReference(),
                        attempt.getUserTransactionId(),
                        attempt.getAdminTransactionId(),
                        attempt.getRejectionReason(),
                        attempt.getProofFileUrl(),
                        attempt.getVerificationStatus(),
                        registration.getEvent().getId(),
                        registration.getPayerName(),
                        registration.getPayerEmail(),
                        registration.getTotalAmount(),
                        attempt.getSubmittedAt() == null ? null : attempt.getSubmittedAt().toInstant(ZoneOffset.UTC),
                        attempt.getVerifiedAt() == null ? null : attempt.getVerifiedAt().toInstant(ZoneOffset.UTC)))
                .toList();
        return new RegistrationDetailDto(
                registration.getId(),
                registration.getEvent().getId(),
                registration.getEvent().getName(),
                registration.getEvent().getYear(),
                registration.getPayerName(),
                registration.getPayerEmail(),
                registration.getPayerIdentityNumber(),
                registration.getPayerAddress(),
                registration.getPayerBloodType(),
                registration.getStatus(),
                registration.getPaymentStatus(),
                registration.getTotalAmount(),
                registration.getGeneratedPaymentReference(),
                registration.isIndemnityAccepted(),
                registration.getCreatedAt() == null ? null : registration.getCreatedAt().toInstant(ZoneOffset.UTC),
                participants,
                attempts);
    }

    Map<String, Integer> requestedShirts(Registration registration) {
        Map<String, Integer> requested = new HashMap<>();
        List<RegistrationShirt> shirtRows = registrationShirtRepository.findByRegistration(registration);
        boolean hasParticipantRows = shirtRows.stream().anyMatch(shirt -> "participant".equals(shirt.getSource()) || shirt.getParticipant() != null);
        if (!hasParticipantRows) {
            for (RegistrationParticipant participant : participantRepository.findByRegistration(registration)) {
                if (participant.getTshirtSize() != null && participant.getTshirtQty() != null && participant.getTshirtQty() > 0) {
                    requested.merge(participant.getTshirtType() + ":" + participant.getTshirtSize(), participant.getTshirtQty(), Integer::sum);
                }
            }
        }
        for (RegistrationShirt shirt : shirtRows) {
            if (shirt.getQuantity() != null && shirt.getQuantity() > 0) {
                requested.merge(shirt.getType() + ":" + shirt.getSize(), shirt.getQuantity(), Integer::sum);
            }
        }
        return requested;
    }

    private Map<String, Integer> requestedShirts(List<ParticipantInput> participants, List<RegistrationQuoteRequest.ShirtOrderDto> extraShirts) {
        Map<String, Integer> requested = new HashMap<>();
        for (ParticipantInput participant : participants) {
            for (RegistrationQuoteRequest.ShirtOrderDto shirtOrder : participantShirtOrders(participant)) {
                if (shirtOrder.size() != null && shirtOrder.type() != null && shirtOrder.quantity() != null && shirtOrder.quantity() > 0) {
                    requested.merge(shirtOrder.type() + ":" + shirtOrder.size(), shirtOrder.quantity(), Integer::sum);
                }
            }
        }
        if (extraShirts != null) {
            for (RegistrationQuoteRequest.ShirtOrderDto extra : extraShirts) {
                if (extra.quantity() != null && extra.quantity() > 0) {
                    requested.merge(extra.type() + ":" + extra.size(), extra.quantity(), Integer::sum);
                }
            }
        }
        return requested;
    }

    private List<String> inventoryWarnings(Event event, Map<String, Integer> requestedBySize) {
        List<String> warnings = new ArrayList<>();
        List<ShirtInventory> inventory = shirtInventoryRepository.findByEvent(event);
        for (Map.Entry<String, Integer> entry : requestedBySize.entrySet()) {
            String[] parts = entry.getKey().split(":");
            String type = parts[0];
            String size = parts[1];
            int available = inventory.stream()
                    .filter(item -> Objects.equals(item.getType(), type) && Objects.equals(item.getSize(), size))
                    .mapToInt(item -> Optional.ofNullable(item.getQuantityAvailable()).orElse(0))
                    .findFirst()
                    .orElse(0);
            if (available < entry.getValue()) {
                warnings.add(String.format("Size %s (%s) only has %d available", size, type, available));
            }
        }
        return warnings;
    }

    private String generatePaymentReference(Event event) {
        int year = Optional.ofNullable(event.getYear()).orElse(LocalDateTime.now().getYear());
        for (int attempts = 0; attempts < 50; attempts++) {
            String reference = "TFR" + year + "-" + String.format("%05d", ThreadLocalRandom.current().nextInt(100_000));
            if (registrationRepository.findByGeneratedPaymentReference(reference).isEmpty()) {
                return reference;
            }
        }
        throw new IllegalStateException("Could not generate a unique payment reference.");
    }

    private List<RegistrationQuoteRequest.ShirtOrderDto> participantShirtOrders(ParticipantInput participant) {
        if (participant.shirtOrders() != null && !participant.shirtOrders().isEmpty()) {
            return participant.shirtOrders();
        }
        if (participant.tshirtSize() != null && participant.tshirtType() != null && participant.tshirtQty() != null && participant.tshirtQty() > 0) {
            return List.of(new RegistrationQuoteRequest.ShirtOrderDto(participant.tshirtSize(), participant.tshirtType(), participant.tshirtQty()));
        }
        return List.of();
    }

    private List<RegistrationQuoteRequest.ShirtOrderDto> participantShirtDtos(RegistrationParticipant participant) {
        List<RegistrationShirt> rows = registrationShirtRepository.findByParticipant(participant);
        if (!rows.isEmpty()) {
            return rows.stream()
                    .map(row -> new RegistrationQuoteRequest.ShirtOrderDto(row.getSize(), row.getType(), row.getQuantity()))
                    .toList();
        }
        if (participant.getTshirtSize() != null && participant.getTshirtQty() != null && participant.getTshirtQty() > 0) {
            return List.of(new RegistrationQuoteRequest.ShirtOrderDto(participant.getTshirtSize(), participant.getTshirtType(), participant.getTshirtQty()));
        }
        return List.of();
    }

    private void confirmNoPaymentRequired(Registration registration) {
        for (Map.Entry<String, Integer> shirt : requestedShirts(registration).entrySet()) {
            String[] parts = shirt.getKey().split(":");
            String type = parts[0];
            String size = parts[1];
            int quantity = shirt.getValue();
            ShirtInventory inventory = shirtInventoryRepository.findByEventIdAndTypeAndSize(
                    registration.getEvent().getId(),
                    type,
                    size).orElseThrow();
            inventory.setQuantityAvailable(inventory.getQuantityAvailable() - quantity);
            inventory.setQuantitySold(inventory.getQuantitySold() + quantity);
            shirtInventoryRepository.save(inventory);
            inventoryMovementRepository.save(InventoryMovement.create(
                    registration.getEvent(),
                    registration,
                    type,
                    size,
                    -quantity,
                    "REGISTRATION_NO_PAYMENT_REQUIRED"));
        }

        registration.setStatus("CONFIRMED");
        registration.setPaymentStatus("CONFIRMED");
        registrationRepository.save(registration);

        Payment payment = new Payment();
        payment.setRegistration(registration);
        payment.setAmount(0);
        payment.setCurrency("SGD");
        payment.setStatus("CONFIRMED");
        payment.setProvider("NO_PAYMENT_REQUIRED");
        payment.setProviderId(registration.getGeneratedPaymentReference());
        payment.setCreatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        emailService.sendPaymentConfirmedEmail(registration);
    }
}
