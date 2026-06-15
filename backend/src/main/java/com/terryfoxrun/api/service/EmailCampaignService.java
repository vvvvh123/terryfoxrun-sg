package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.CorporateOrder;
import com.terryfoxrun.api.domain.EmailCampaign;
import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.Registration;
import com.terryfoxrun.api.dto.EmailAudienceSegmentDto;
import com.terryfoxrun.api.dto.EmailCampaignDto;
import com.terryfoxrun.api.dto.EmailCampaignRequest;
import com.terryfoxrun.api.repo.CorporateOrderRepository;
import com.terryfoxrun.api.repo.EmailCampaignRepository;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.RegistrationRepository;
import com.terryfoxrun.api.service.email.EmailService;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class EmailCampaignService {
    private final EventRepository eventRepository;
    private final EmailCampaignRepository emailCampaignRepository;
    private final RegistrationRepository registrationRepository;
    private final CorporateOrderRepository corporateOrderRepository;
    private final EmailService emailService;

    public EmailCampaignService(EventRepository eventRepository,
                                EmailCampaignRepository emailCampaignRepository,
                                RegistrationRepository registrationRepository,
                                CorporateOrderRepository corporateOrderRepository,
                                EmailService emailService) {
        this.eventRepository = eventRepository;
        this.emailCampaignRepository = emailCampaignRepository;
        this.registrationRepository = registrationRepository;
        this.corporateOrderRepository = corporateOrderRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public List<EmailCampaignDto> list(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return emailCampaignRepository.findByEventOrderByCreatedAtDesc(event).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<EmailAudienceSegmentDto> audiences(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        List<Registration> registrations = registrationRepository.findByEvent(event);
        List<CorporateOrder> corporateOrders = corporateOrderRepository.findByEvent(event);
        return List.of(
                new EmailAudienceSegmentDto("all-participants", "All registered participants", "Every individual registration for this event.", registrations.size()),
                new EmailAudienceSegmentDto("confirmed-participants", "Confirmed participants", "Registrations with confirmed payment or no payment required.", countByPaymentStatus(registrations, "CONFIRMED")),
                new EmailAudienceSegmentDto("pending-payment", "Waiting for payment confirmation", "Participants who clicked paid and are waiting for admin verification.", countByPaymentStatus(registrations, "PENDING_ADMIN_VERIFICATION")),
                new EmailAudienceSegmentDto("payment-rejected", "Payment rejected / needs attention", "Participants whose payment proof needs follow-up.", countByPaymentStatus(registrations, "PAYMENT_REJECTED")),
                new EmailAudienceSegmentDto("corporate-contacts", "Corporate contacts", "Submitted corporate order contacts.", corporateOrders.size()),
                new EmailAudienceSegmentDto("test-preview", "Test preview only", "Creates a local preview without selecting a participant audience.", 1));
    }

    @Transactional
    public EmailCampaignDto create(Long eventId, String createdBy, EmailCampaignRequest request) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        EmailCampaign campaign = new EmailCampaign();
        campaign.setEvent(event);
        campaign.setAudience(request.audience());
        campaign.setSubject(request.subject());
        campaign.setBody(request.body());
        campaign.setCreatedBy(createdBy);
        campaign.setCreatedAt(LocalDateTime.now());
        String deliveryMode = normalizeDeliveryMode(request.deliveryMode());
        if ("preview".equals(deliveryMode)) {
            campaign.setSentStatus("PREVIEW_CREATED");
            campaign.setSentAt(LocalDateTime.now());
            emailService.sendCampaignPreview(request.audience(), request.subject(), request.body());
        } else if ("send".equals(deliveryMode)) {
            if (!emailService.isLiveDeliveryAvailable()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Live email sending is not configured yet. Save a draft or send a preview instead.");
            }
            Set<String> recipients = resolveRecipients(event, request.audience());
            recipients.forEach(email -> emailService.sendCampaignEmail(email, request.subject(), request.body()));
            campaign.setSentStatus("SENT");
            campaign.setSentAt(LocalDateTime.now());
        } else {
            campaign.setSentStatus("DRAFT");
        }
        return toDto(emailCampaignRepository.save(campaign));
    }

    private String normalizeDeliveryMode(String deliveryMode) {
        String normalized = deliveryMode == null ? "" : deliveryMode.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "draft", "preview", "send" -> normalized;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported email delivery mode.");
        };
    }

    private Set<String> resolveRecipients(Event event, String audience) {
        return switch (audience) {
            case "all-participants" -> registrationRepository.findByEvent(event).stream()
                    .map(Registration::getPayerEmail)
                    .filter(StringUtils::hasText)
                    .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
            case "confirmed-participants" -> registrationRepository.findByEvent(event).stream()
                    .filter(registration -> "CONFIRMED".equals(registration.getPaymentStatus()))
                    .map(Registration::getPayerEmail)
                    .filter(StringUtils::hasText)
                    .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
            case "pending-payment" -> registrationRepository.findByEvent(event).stream()
                    .filter(registration -> "PENDING_ADMIN_VERIFICATION".equals(registration.getPaymentStatus()))
                    .map(Registration::getPayerEmail)
                    .filter(StringUtils::hasText)
                    .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
            case "payment-rejected" -> registrationRepository.findByEvent(event).stream()
                    .filter(registration -> "PAYMENT_REJECTED".equals(registration.getPaymentStatus()))
                    .map(Registration::getPayerEmail)
                    .filter(StringUtils::hasText)
                    .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
            case "corporate-contacts" -> corporateOrderRepository.findByEvent(event).stream()
                    .map(CorporateOrder::getContactEmail)
                    .filter(StringUtils::hasText)
                    .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
            case "test-preview" -> Set.of();
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown audience segment.");
        };
    }

    private EmailCampaignDto toDto(EmailCampaign campaign) {
        return new EmailCampaignDto(
                campaign.getId(),
                campaign.getEvent().getId(),
                campaign.getAudience(),
                campaign.getSubject(),
                campaign.getBody(),
                campaign.getSentStatus(),
                campaign.getCreatedBy(),
                campaign.getCreatedAt() == null ? null : campaign.getCreatedAt().toInstant(ZoneOffset.UTC),
                campaign.getSentAt() == null ? null : campaign.getSentAt().toInstant(ZoneOffset.UTC));
    }

    private long countByPaymentStatus(List<Registration> registrations, String paymentStatus) {
        return registrations.stream().filter(registration -> paymentStatus.equals(registration.getPaymentStatus())).count();
    }
}
