package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.RegistrationParticipant;
import com.terryfoxrun.api.domain.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationParticipantRepository extends JpaRepository<RegistrationParticipant, Long> {
    List<RegistrationParticipant> findByRegistration(Registration registration);
    List<RegistrationParticipant> findByRegistrationIn(List<Registration> registrations);
    List<RegistrationParticipant> findByRegistration_Event_Id(Long eventId);
    Optional<RegistrationParticipant> findByPickupToken(String pickupToken);
    Optional<RegistrationParticipant> findByPickupCode(String pickupCode);
}
