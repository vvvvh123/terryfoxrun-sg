package com.terryfoxrun.api.api;

import com.terryfoxrun.api.domain.PaymentAttempt;
import com.terryfoxrun.api.dto.PaymentAttemptDto;
import com.terryfoxrun.api.dto.PaymentConfirmRequest;
import com.terryfoxrun.api.dto.PaymentSubmitRequest;
import com.terryfoxrun.api.service.PaymentService;
import jakarta.validation.Valid;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/registrations/{registrationId}/payment-attempts")
    public ResponseEntity<PaymentAttemptDto> submitManualPayment(@PathVariable Long registrationId,
                                                                 @Valid @RequestBody PaymentSubmitRequest request) {
        return ResponseEntity.ok(toDto(paymentService.submitManualPayment(
                registrationId,
                request.method(),
                request.userTransactionId(),
                request.proofFileUrl())));
    }

    @PostMapping("/admin/payment-attempts/{paymentAttemptId}/confirm")
    public ResponseEntity<PaymentAttemptDto> confirmPayment(@PathVariable Long paymentAttemptId,
                                                            @Valid @RequestBody PaymentConfirmRequest request) {
        return ResponseEntity.ok(toDto(paymentService.confirmPayment(
                paymentAttemptId,
                request.adminTransactionId(),
                request.verifiedBy())));
    }

    @GetMapping("/admin/payment-attempts")
    public ResponseEntity<List<PaymentAttemptDto>> listPaymentAttempts(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(paymentService.listPaymentAttempts(status).stream()
                .map(this::toDto)
                .toList());
    }

    private PaymentAttemptDto toDto(PaymentAttempt attempt) {
        return new PaymentAttemptDto(
                attempt.getId(),
                attempt.getRegistration().getId(),
                attempt.getMethod(),
                attempt.getGeneratedReference(),
                attempt.getUserTransactionId(),
                attempt.getAdminTransactionId(),
                attempt.getVerificationStatus(),
                attempt.getSubmittedAt() == null ? null : attempt.getSubmittedAt().toInstant(ZoneOffset.UTC),
                attempt.getVerifiedAt() == null ? null : attempt.getVerifiedAt().toInstant(ZoneOffset.UTC));
    }
}
