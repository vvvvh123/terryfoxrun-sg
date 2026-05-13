package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.PaymentAttempt;
import com.terryfoxrun.api.domain.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, Long> {
    List<PaymentAttempt> findByRegistration(Registration registration);
    List<PaymentAttempt> findByRegistrationOrderBySubmittedAtDesc(Registration registration);
    List<PaymentAttempt> findByVerificationStatusOrderBySubmittedAtAsc(String verificationStatus);
}
