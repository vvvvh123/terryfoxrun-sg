package com.terryfoxrun.api.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_attempts")
public class PaymentAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private Registration registration;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    private String generatedReference;
    private String userTransactionId;
    private String proofFileUrl;
    private String verificationStatus;
    private String adminTransactionId;
    private String verifiedBy;
    private LocalDateTime submittedAt;
    private LocalDateTime verifiedAt;

    public Long getId() {
        return id;
    }

    public Registration getRegistration() {
        return registration;
    }

    public void setRegistration(Registration registration) {
        this.registration = registration;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public String getGeneratedReference() {
        return generatedReference;
    }

    public void setGeneratedReference(String generatedReference) {
        this.generatedReference = generatedReference;
    }

    public String getUserTransactionId() {
        return userTransactionId;
    }

    public void setUserTransactionId(String userTransactionId) {
        this.userTransactionId = userTransactionId;
    }

    public String getProofFileUrl() {
        return proofFileUrl;
    }

    public void setProofFileUrl(String proofFileUrl) {
        this.proofFileUrl = proofFileUrl;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getAdminTransactionId() {
        return adminTransactionId;
    }

    public void setAdminTransactionId(String adminTransactionId) {
        this.adminTransactionId = adminTransactionId;
    }

    public String getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
