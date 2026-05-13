package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}

