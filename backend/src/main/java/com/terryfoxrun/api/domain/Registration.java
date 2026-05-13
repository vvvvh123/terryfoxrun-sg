package com.terryfoxrun.api.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "registrations")
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    private String payerUserId;
    private String payerName;
    private String payerEmail;
    private String payerIdentityNumber;
    private String payerAddress;
    private String payerBloodType;
    private String status;
    private Integer totalAmount;
    private String paymentStatus;
    private String generatedPaymentReference;
    private boolean indemnityAccepted;
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RegistrationParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Donation> donations = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getPayerUserId() {
        return payerUserId;
    }

    public void setPayerUserId(String payerUserId) {
        this.payerUserId = payerUserId;
    }

    public String getPayerName() {
        return payerName;
    }

    public void setPayerName(String payerName) {
        this.payerName = payerName;
    }

    public String getPayerEmail() {
        return payerEmail;
    }

    public void setPayerEmail(String payerEmail) {
        this.payerEmail = payerEmail;
    }

    public String getPayerIdentityNumber() {
        return payerIdentityNumber;
    }

    public void setPayerIdentityNumber(String payerIdentityNumber) {
        this.payerIdentityNumber = payerIdentityNumber;
    }

    public String getPayerAddress() {
        return payerAddress;
    }

    public void setPayerAddress(String payerAddress) {
        this.payerAddress = payerAddress;
    }

    public String getPayerBloodType() {
        return payerBloodType;
    }

    public void setPayerBloodType(String payerBloodType) {
        this.payerBloodType = payerBloodType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Integer totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getGeneratedPaymentReference() {
        return generatedPaymentReference;
    }

    public void setGeneratedPaymentReference(String generatedPaymentReference) {
        this.generatedPaymentReference = generatedPaymentReference;
    }

    public boolean isIndemnityAccepted() {
        return indemnityAccepted;
    }

    public void setIndemnityAccepted(boolean indemnityAccepted) {
        this.indemnityAccepted = indemnityAccepted;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<RegistrationParticipant> getParticipants() {
        return participants;
    }

    public void setParticipants(List<RegistrationParticipant> participants) {
        this.participants = participants;
    }

    public List<Donation> getDonations() {
        return donations;
    }

    public void setDonations(List<Donation> donations) {
        this.donations = donations;
    }
}
