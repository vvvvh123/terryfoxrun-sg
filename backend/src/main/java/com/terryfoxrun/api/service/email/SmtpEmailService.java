package com.terryfoxrun.api.service.email;

import com.terryfoxrun.api.domain.Registration;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Primary
@Service
public class SmtpEmailService implements EmailService {
    private static final Logger log = LoggerFactory.getLogger(SmtpEmailService.class);

    private final JavaMailSender mailSender;
    private final LocalEmailService localEmailService;
    private final boolean smtpEnabled;
    private final String smtpHost;
    private final String smtpUsername;
    private final String fromAddress;
    private final String fromName;
    private final String previewRecipient;

    public SmtpEmailService(JavaMailSender mailSender,
                            LocalEmailService localEmailService,
                            @Value("${app.email.smtp.enabled:false}") boolean smtpEnabled,
                            @Value("${spring.mail.host:}") String smtpHost,
                            @Value("${spring.mail.username:}") String smtpUsername,
                            @Value("${app.email.from-address:auto@terryfoxrun.global}") String fromAddress,
                            @Value("${app.email.from-name:Terry Fox Run Singapore}") String fromName,
                            @Value("${app.email.preview-recipient:auto@terryfoxrun.global}") String previewRecipient) {
        this.mailSender = mailSender;
        this.localEmailService = localEmailService;
        this.smtpEnabled = smtpEnabled;
        this.smtpHost = smtpHost;
        this.smtpUsername = smtpUsername;
        this.fromAddress = fromAddress;
        this.fromName = fromName;
        this.previewRecipient = previewRecipient;
    }

    @Override
    public void sendPendingPaymentEmail(Registration registration) {
        deliver(LocalEmailService.pendingPaymentPreview(registration));
    }

    @Override
    public void sendPaymentConfirmedEmail(Registration registration) {
        deliver(LocalEmailService.paymentConfirmedPreview(registration));
    }

    @Override
    public void sendPaymentRejectedEmail(Registration registration, String reason) {
        deliver(LocalEmailService.paymentRejectedPreview(registration, reason));
    }

    @Override
    public void sendContactSubmissionEmail(String recipientEmail, String fromEmail, String senderName, String message) {
        deliver(LocalEmailService.contactSubmissionPreview(recipientEmail, fromEmail, senderName, message));
    }

    @Override
    public void sendAnnouncementEmail(String recipientEmail, String subject, String body) {
        deliver(LocalEmailService.announcementPreview(recipientEmail, subject, body));
    }

    @Override
    public void sendCampaignPreview(String audience, String subject, String body) {
        EmailPreview preview = LocalEmailService.campaignPreview(audience, subject, "Audience: " + audience + "\n\n" + body);
        deliver(preview, previewRecipient);
    }

    private void deliver(EmailPreview preview) {
        deliver(preview, preview.to());
    }

    private void deliver(EmailPreview preview, String recipientEmail) {
        localEmailService.record(preview);
        if (!isSmtpReady()) {
            return;
        }
        if (!StringUtils.hasText(recipientEmail) || !recipientEmail.contains("@")) {
            log.info("Skipping SMTP delivery for [{}] because recipient is not an email address.", preview.template());
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress, fromName);
            helper.setTo(recipientEmail);
            helper.setSubject(preview.subject());
            helper.setText(preview.body(), false);
            mailSender.send(message);
            log.info("SMTP email [{}] sent to {}", preview.template(), recipientEmail);
        } catch (MailException | MessagingException | UnsupportedEncodingException ex) {
            log.warn("SMTP delivery failed for [{}] to {}. Local preview was kept.", preview.template(), recipientEmail, ex);
        }
    }

    private boolean isSmtpReady() {
        return smtpEnabled
                && StringUtils.hasText(smtpHost)
                && StringUtils.hasText(smtpUsername)
                && StringUtils.hasText(fromAddress);
    }
}
