package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Registration;
import com.terryfoxrun.api.domain.RegistrationParticipant;
import com.terryfoxrun.api.domain.RegistrationShirt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationShirtRepository extends JpaRepository<RegistrationShirt, Long> {
    List<RegistrationShirt> findByRegistration(Registration registration);
    List<RegistrationShirt> findByParticipant(RegistrationParticipant participant);
}
