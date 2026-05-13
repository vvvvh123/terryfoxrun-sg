package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.InventoryMovement;
import com.terryfoxrun.api.domain.Payment;
import com.terryfoxrun.api.domain.PaymentAttempt;
import com.terryfoxrun.api.domain.PaymentMethod;
import com.terryfoxrun.api.domain.Registration;
import com.terryfoxrun.api.domain.ShirtInventory;
import com.terryfoxrun.api.repo.InventoryMovementRepository;
import com.terryfoxrun.api.repo.PaymentAttemptRepository;
import com.terryfoxrun.api.repo.PaymentRepository;
import com.terryfoxrun.api.repo.RegistrationRepository;
import com.terryfoxrun.api.repo.ShirtInventoryRepository;
import com.terryfoxrun.api.service.email.EmailService;
import com.terryfoxrun.api.service.storage.StorageService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private final RegistrationRepository registrationRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final PaymentRepository paymentRepository;
    private final ShirtInventoryRepository shirtInventoryRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final RegistrationService registrationService;
    private final EmailService emailService;
    private final StorageService storageService;

    public PaymentService(RegistrationRepository registrationRepository,
                          PaymentAttemptRepository paymentAttemptRepository,
                          PaymentRepository paymentRepository,
                          ShirtInventoryRepository shirtInventoryRepository,
                          InventoryMovementRepository inventoryMovementRepository,
                          RegistrationService registrationService,
                          EmailService emailService,
                          StorageService storageService) {
        this.registrationRepository = registrationRepository;
        this.paymentAttemptRepository = paymentAttemptRepository;
        this.paymentRepository = paymentRepository;
        this.shirtInventoryRepository = shirtInventoryRepository;
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.registrationService = registrationService;
        this.emailService = emailService;
        this.storageService = storageService;
    }

    @Transactional
    public PaymentAttempt submitManualPayment(Long registrationId, PaymentMethod method, String userTransactionId, String proofFileUrl) {
        Registration registration = registrationRepository.findById(registrationId).orElseThrow();

        PaymentAttempt attempt = new PaymentAttempt();
        attempt.setRegistration(registration);
        attempt.setMethod(method);
        attempt.setGeneratedReference(registration.getGeneratedPaymentReference());
        attempt.setUserTransactionId(userTransactionId);
        attempt.setProofFileUrl(storageService.normalizeProofReference(proofFileUrl));
        attempt.setVerificationStatus("PENDING_ADMIN_VERIFICATION");
        attempt.setSubmittedAt(LocalDateTime.now());
        paymentAttemptRepository.save(attempt);

        registration.setStatus("WAITING_FOR_PAYMENT_CONFIRMATION");
        registration.setPaymentStatus("PENDING_ADMIN_VERIFICATION");
        registrationRepository.save(registration);
        emailService.sendPendingPaymentEmail(registration);
        return attempt;
    }

    @Transactional(readOnly = true)
    public List<PaymentAttempt> listPaymentAttempts(String verificationStatus, PaymentMethod method, Long eventId) {
        return paymentAttemptRepository.findAll().stream()
                .filter(attempt -> verificationStatus == null || verificationStatus.isBlank()
                        || Objects.equals(attempt.getVerificationStatus(), verificationStatus))
                .filter(attempt -> method == null || attempt.getMethod() == method)
                .filter(attempt -> eventId == null || Objects.equals(attempt.getRegistration().getEvent().getId(), eventId))
                .sorted((left, right) -> {
                    if (left.getSubmittedAt() == null && right.getSubmittedAt() == null) return 0;
                    if (left.getSubmittedAt() == null) return 1;
                    if (right.getSubmittedAt() == null) return -1;
                    return left.getSubmittedAt().compareTo(right.getSubmittedAt());
                })
                .toList();
    }

    @Transactional
    public PaymentAttempt confirmPayment(Long paymentAttemptId, String adminTransactionId, String verifiedBy) {
        PaymentAttempt attempt = paymentAttemptRepository.findById(paymentAttemptId).orElseThrow();
        Registration registration = attempt.getRegistration();
        if ("CONFIRMED".equals(registration.getPaymentStatus())) {
            return attempt;
        }

        attempt.setAdminTransactionId(adminTransactionId);
        attempt.setVerifiedBy(verifiedBy);
        attempt.setVerificationStatus("CONFIRMED");
        attempt.setVerifiedAt(LocalDateTime.now());

        for (Map.Entry<String, Integer> shirt : registrationService.requestedShirts(registration).entrySet()) {
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
                    "REGISTRATION_PAYMENT_CONFIRMED"));
        }

        registration.setStatus("CONFIRMED");
        registration.setPaymentStatus("CONFIRMED");
        registrationRepository.save(registration);

        Payment payment = new Payment();
        payment.setRegistration(registration);
        payment.setAmount(registration.getTotalAmount());
        payment.setCurrency("SGD");
        payment.setStatus("CONFIRMED");
        payment.setProvider(attempt.getMethod().name());
        payment.setProviderId(adminTransactionId);
        payment.setCreatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        emailService.sendPaymentConfirmedEmail(registration);

        return paymentAttemptRepository.save(attempt);
    }

    @Transactional
    public PaymentAttempt rejectPayment(Long paymentAttemptId, String rejectionReason, String verifiedBy) {
        PaymentAttempt attempt = paymentAttemptRepository.findById(paymentAttemptId).orElseThrow();
        Registration registration = attempt.getRegistration();
        if ("CONFIRMED".equals(registration.getPaymentStatus())) {
            throw new IllegalStateException("Confirmed payments cannot be rejected.");
        }

        attempt.setVerifiedBy(verifiedBy);
        attempt.setVerificationStatus("PAYMENT_REJECTED");
        attempt.setRejectionReason(rejectionReason);
        attempt.setVerifiedAt(LocalDateTime.now());

        registration.setStatus("PAYMENT_REJECTED");
        registration.setPaymentStatus("PAYMENT_REJECTED");
        registrationRepository.save(registration);
        emailService.sendPaymentRejectedEmail(registration, rejectionReason);

        return paymentAttemptRepository.save(attempt);
    }
}
