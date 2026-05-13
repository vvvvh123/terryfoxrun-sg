package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationRepository extends JpaRepository<Donation, Long> {
}

