package com.terryfoxrun.api.service.email;

import com.terryfoxrun.api.domain.Registration;

public interface EmailService {
    void sendPendingPaymentEmail(Registration registration);

    void sendPaymentConfirmedEmail(Registration registration);

    void sendPaymentRejectedEmail(Registration registration, String reason);

    void sendContactSubmissionEmail(String recipientEmail, String fromEmail, String senderName, String message);

    void sendCampaignPreview(String audience, String subject, String body);
}
