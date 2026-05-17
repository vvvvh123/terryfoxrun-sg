package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.ContactSubmission;
import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.dto.ContactSubmissionRequest;
import com.terryfoxrun.api.dto.ContactSubmissionResponse;
import com.terryfoxrun.api.repo.ContactSubmissionRepository;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.service.email.EmailService;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactSubmissionService {
    private final EventRepository eventRepository;
    private final ContactSubmissionRepository contactSubmissionRepository;
    private final EmailService emailService;

    public ContactSubmissionService(EventRepository eventRepository,
                                    ContactSubmissionRepository contactSubmissionRepository,
                                    EmailService emailService) {
        this.eventRepository = eventRepository;
        this.contactSubmissionRepository = contactSubmissionRepository;
        this.emailService = emailService;
    }

    @Transactional
    public ContactSubmissionResponse submit(Long eventId, ContactSubmissionRequest request) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        String recipient = event.getContactRecipientEmail() == null || event.getContactRecipientEmail().isBlank()
                ? "corporate@terryfoxrun.global"
                : event.getContactRecipientEmail();

        ContactSubmission submission = new ContactSubmission();
        submission.setEvent(event);
        submission.setFirstName(request.firstName());
        submission.setLastName(request.lastName());
        submission.setEmail(request.email());
        submission.setMessage(request.message());
        submission.setRecipientEmail(recipient);
        submission.setStatus("EMAIL_PREVIEW_CREATED");
        submission.setCreatedAt(LocalDateTime.now());
        contactSubmissionRepository.save(submission);

        emailService.sendContactSubmissionEmail(
                recipient,
                request.email(),
                request.firstName() + " " + request.lastName(),
                request.message());

        return new ContactSubmissionResponse(submission.getId(), submission.getStatus(), recipient);
    }
}
