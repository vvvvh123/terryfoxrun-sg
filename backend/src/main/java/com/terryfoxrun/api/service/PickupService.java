package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.RegistrationParticipant;
import com.terryfoxrun.api.repo.RegistrationParticipantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PickupService {

    private final RegistrationParticipantRepository participantRepository;

    public PickupService(RegistrationParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    @Transactional
    public Optional<RegistrationParticipant> markCollected(String tokenOrCode) {
        Optional<RegistrationParticipant> participant = participantRepository.findByPickupToken(tokenOrCode);
        if (participant.isEmpty()) {
            participant = participantRepository.findByPickupCode(tokenOrCode);
        }
        participant.ifPresent(p -> {
            p.setPickupStatus("collected");
            p.setPickupTimestamp(LocalDateTime.now());
            participantRepository.save(p);
        });
        return participant;
    }
}

