package com.terryfoxrun.api.service.email;

import com.terryfoxrun.api.domain.Registration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LocalEmailService implements EmailService {
    private static final Logger log = LoggerFactory.getLogger(LocalEmailService.class);

    private final List<EmailPreview> sentEmails = new ArrayList<>();

    @Override
    public void sendPendingPaymentEmail(Registration registration) {
        record(pendingPaymentPreview(registration));
    }

    @Override
    public void sendPaymentConfirmedEmail(Registration registration) {
        record(paymentConfirmedPreview(registration));
    }

    @Override
    public void sendPaymentRejectedEmail(Registration registration, String reason) {
        record(paymentRejectedPreview(registration, reason));
    }

    @Override
    public void sendContactSubmissionEmail(String recipientEmail, String fromEmail, String senderName, String message) {
        record(contactSubmissionPreview(recipientEmail, fromEmail, senderName, message));
    }

    @Override
    public void sendAnnouncementEmail(String recipientEmail, String subject, String body) {
        record(announcementPreview(recipientEmail, subject, body));
    }

    @Override
    public void sendCampaignPreview(String audience, String subject, String body) {
        record(campaignPreview(audience, subject, body));
    }

    public List<EmailPreview> sentEmails() {
        return List.copyOf(sentEmails);
    }

    public void clear() {
        sentEmails.clear();
    }

    public void record(EmailPreview preview) {
        sentEmails.add(preview);
        log.info("Email preview [{}] to {} for registration {}", preview.template(), preview.to(), preview.registrationId());
    }

    static EmailPreview pendingPaymentPreview(Registration registration) {
        return new EmailPreview(
                "pending-payment",
                registration.getPayerEmail(),
                "Terry Fox Run payment pending",
                "We received your payment submission for reference " + registration.getGeneratedPaymentReference() + ".",
                registration.getId(),
                Instant.now());
    }

    static EmailPreview paymentConfirmedPreview(Registration registration) {
        return new EmailPreview(
                "payment-confirmed",
                registration.getPayerEmail(),
                "Terry Fox Run registration confirmed",
                "Your registration is confirmed. Your pickup code is available in My Events.",
                registration.getId(),
                Instant.now());
    }

    static EmailPreview paymentRejectedPreview(Registration registration, String reason) {
        return new EmailPreview(
                "payment-rejected",
                registration.getPayerEmail(),
                "Terry Fox Run payment needs attention",
                "Your payment could not be confirmed: " + reason,
                registration.getId(),
                Instant.now());
    }

    static EmailPreview contactSubmissionPreview(String recipientEmail, String fromEmail, String senderName, String message) {
        return new EmailPreview(
                "contact-submission",
                recipientEmail,
                "Terry Fox Run website contact submission",
                senderName + " (" + fromEmail + ") wrote: " + message,
                null,
                Instant.now());
    }

    static EmailPreview announcementPreview(String recipientEmail, String subject, String body) {
        return new EmailPreview(
                "announcement",
                recipientEmail,
                subject,
                body,
                null,
                Instant.now());
    }

    static EmailPreview campaignPreview(String audience, String subject, String body) {
        return new EmailPreview(
                "email-campaign-preview",
                audience,
                subject,
                body,
                null,
                Instant.now());
    }
}
