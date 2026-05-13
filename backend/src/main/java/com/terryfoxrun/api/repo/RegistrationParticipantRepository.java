package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.RegistrationParticipant;
import com.terryfoxrun.api.domain.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationParticipantRepository extends JpaRepository<RegistrationParticipant, Long> {
    List<RegistrationParticipant> findByRegistration(Registration registration);
    Optional<RegistrationParticipant> findByPickupToken(String pickupToken);
    Optional<RegistrationParticipant> findByPickupCode(String pickupCode);
}
