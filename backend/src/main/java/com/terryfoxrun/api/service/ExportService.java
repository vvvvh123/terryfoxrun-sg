package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.Registration;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class ExportService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;

    public ExportService(EventRepository eventRepository, RegistrationRepository registrationRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
    }

    @Transactional(readOnly = true)
    public byte[] registrationsCsv(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        List<Registration> regs = registrationRepository.findByEvent(event);
        StringBuilder sb = new StringBuilder("registration_id,payer_user_id,total_amount,payment_status,created_at\n");
        regs.forEach(r -> sb.append(r.getId()).append(",")
                .append(r.getPayerUserId()).append(",")
                .append(r.getTotalAmount()).append(",")
                .append(r.getPaymentStatus()).append(",")
                .append(r.getCreatedAt()).append("\n"));
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    // Placeholders for corporate and finance exports
    public byte[] corporateCsv(Long eventId) {
        return "not_implemented\n".getBytes(StandardCharsets.UTF_8);
    }

    public byte[] financeCsv(Long eventId) {
        return "not_implemented\n".getBytes(StandardCharsets.UTF_8);
    }
}

