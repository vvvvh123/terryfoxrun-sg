package com.terryfoxrun.api.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.terryfoxrun.api.domain.Category;
import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.InventoryMovement;
import com.terryfoxrun.api.domain.PaymentAttempt;
import com.terryfoxrun.api.domain.PaymentMethod;
import com.terryfoxrun.api.domain.Registration;
import com.terryfoxrun.api.domain.ShirtInventory;
import com.terryfoxrun.api.dto.ParticipantInput;
import com.terryfoxrun.api.dto.RegistrationCreateRequest;
import com.terryfoxrun.api.dto.RegistrationQuoteRequest;
import com.terryfoxrun.api.repo.CategoryRepository;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.InventoryMovementRepository;
import com.terryfoxrun.api.repo.PaymentAttemptRepository;
import com.terryfoxrun.api.repo.RegistrationRepository;
import com.terryfoxrun.api.repo.ShirtInventoryRepository;
import com.terryfoxrun.api.service.email.LocalEmailService;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RegistrationPaymentFlowTest {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ShirtInventoryRepository shirtInventoryRepository;

    @Autowired
    private InventoryMovementRepository inventoryMovementRepository;

    @Autowired
    private PaymentAttemptRepository paymentAttemptRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private LocalEmailService localEmailService;

    private Event event;
    private Category category;

    @BeforeEach
    void setUp() {
        event = eventRepository.save(Event.createCurrent(
                "tfr-2026",
                "Terry Fox Run Singapore 2026",
                "Angsana Green, East Coast Park",
                Instant.parse("2026-11-29T23:00:00Z"),
                25_00));
        category = categoryRepository.save(Category.create(event, "5K Fun Run", 1));
        shirtInventoryRepository.save(ShirtInventory.create(event, "classic", "M", 40));
        localEmailService.clear();
    }

    @Test
    void createsRegistrationWithGeneratedPaymentReferenceAndManualPaymentAttempt() {
        Registration registration = registrationService.create("supabase|sam", new RegistrationCreateRequest(
                event.getId(),
                "Sam Tan",
                "sam@example.com",
                "S1234567A",
                "1 Terry Fox Way, Singapore",
                "O+",
                List.of(new ParticipantInput(
                        category.getId(),
                        "Sam Tan",
                        "sam@example.com",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "1 Terry Fox Way, Singapore",
                        "S1234567A",
                        "O+",
                        "M",
                        "classic",
                        2)),
                10_00,
                null,
                true,
                null,
                null));

        PaymentAttempt attempt = paymentService.submitManualPayment(
                registration.getId(),
                PaymentMethod.PAYNOW,
                "PAYNOW-USER-123",
                "https://storage.example/proof.png");

        Registration saved = registrationRepository.findById(registration.getId()).orElseThrow();

        assertThat(saved.getGeneratedPaymentReference()).matches("TFR2026-\\d{5}");
        assertThat(saved.getTotalAmount()).isEqualTo(60_00);
        assertThat(saved.getStatus()).isEqualTo("WAITING_FOR_PAYMENT_CONFIRMATION");
        assertThat(saved.getPaymentStatus()).isEqualTo("PENDING_ADMIN_VERIFICATION");
        assertThat(saved.getParticipants()).hasSize(1);
        assertThat(attempt.getGeneratedReference()).isEqualTo(saved.getGeneratedPaymentReference());
        assertThat(attempt.getUserTransactionId()).isEqualTo("PAYNOW-USER-123");
    }

    @Test
    void confirmingManualPaymentMarksRegistrationPaidAndCreatesInventoryMovements() {
        Registration registration = registrationService.create("supabase|asha", new RegistrationCreateRequest(
                event.getId(),
                "Asha Lim",
                "asha@example.com",
                "S7654321B",
                "2 Marathon Road, Singapore",
                "A+",
                List.of(new ParticipantInput(
                        category.getId(),
                        "Asha Lim",
                        "asha@example.com",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "2 Marathon Road, Singapore",
                        "S7654321B",
                        "A+",
                        "M",
                        "classic",
                        1)),
                5_00,
                null,
                true,
                null,
                null));
        PaymentAttempt attempt = paymentService.submitManualPayment(
                registration.getId(),
                PaymentMethod.BANK_TRANSFER,
                "FAST-USER-456",
                null);

        assertThat(attempt.getProofFileUrl()).isNull();

        paymentService.confirmPayment(attempt.getId(), "BANK-SETTLED-999", "admin@example.com");

        Registration saved = registrationRepository.findById(registration.getId()).orElseThrow();
        List<InventoryMovement> movements = inventoryMovementRepository.findByRegistrationId(saved.getId());
        ShirtInventory stock = shirtInventoryRepository.findByEventIdAndTypeAndSize(event.getId(), "classic", "M")
                .orElseThrow();

        assertThat(saved.getStatus()).isEqualTo("CONFIRMED");
        assertThat(saved.getPaymentStatus()).isEqualTo("CONFIRMED");
        assertThat(paymentAttemptRepository.findById(attempt.getId()).orElseThrow().getAdminTransactionId())
                .isEqualTo("BANK-SETTLED-999");
        assertThat(stock.getQuantityAvailable()).isEqualTo(39);
        assertThat(movements).hasSize(1);
        assertThat(movements.get(0).getQuantityDelta()).isEqualTo(-1);
        assertThat(movements.get(0).getReason()).isEqualTo("REGISTRATION_PAYMENT_CONFIRMED");
        assertThat(localEmailService.sentEmails())
                .extracting(email -> email.template())
                .contains("pending-payment", "payment-confirmed");
    }

    @Test
    void rejectingManualPaymentMarksRegistrationRejectedAndDoesNotMoveInventory() {
        Registration registration = registrationService.create("supabase|mei", new RegistrationCreateRequest(
                event.getId(),
                "Mei Wong",
                "mei@example.com",
                "S1111111C",
                "3 Run Road, Singapore",
                "B+",
                List.of(new ParticipantInput(
                        category.getId(),
                        "Mei Wong",
                        "mei@example.com",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "3 Run Road, Singapore",
                        "111C",
                        "B+",
                        "M",
                        "classic",
                        1)),
                0,
                null,
                true,
                null,
                null));
        PaymentAttempt attempt = paymentService.submitManualPayment(
                registration.getId(),
                PaymentMethod.PAYNOW,
                "PAYNOW-REJECT-001",
                "unclear proof");

        paymentService.rejectPayment(attempt.getId(), "wrong transfer amount", "admin@example.com");

        Registration saved = registrationRepository.findById(registration.getId()).orElseThrow();
        PaymentAttempt savedAttempt = paymentAttemptRepository.findById(attempt.getId()).orElseThrow();
        ShirtInventory stock = shirtInventoryRepository.findByEventIdAndTypeAndSize(event.getId(), "classic", "M")
                .orElseThrow();

        assertThat(saved.getStatus()).isEqualTo("PAYMENT_REJECTED");
        assertThat(saved.getPaymentStatus()).isEqualTo("PAYMENT_REJECTED");
        assertThat(savedAttempt.getVerificationStatus()).isEqualTo("PAYMENT_REJECTED");
        assertThat(savedAttempt.getRejectionReason()).isEqualTo("wrong transfer amount");
        assertThat(stock.getQuantityAvailable()).isEqualTo(40);
        assertThat(inventoryMovementRepository.findByRegistrationId(saved.getId())).isEmpty();
        assertThat(localEmailService.sentEmails())
                .extracting(email -> email.template())
                .contains("pending-payment", "payment-rejected");
    }
}
