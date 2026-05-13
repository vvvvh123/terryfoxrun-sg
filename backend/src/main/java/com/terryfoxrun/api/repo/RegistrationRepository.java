package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByEvent(Event event);
    List<Registration> findByPayerUserId(String payerUserId);
    Optional<Registration> findByGeneratedPaymentReference(String generatedPaymentReference);
}
