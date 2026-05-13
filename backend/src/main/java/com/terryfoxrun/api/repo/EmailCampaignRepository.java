package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.EmailCampaign;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailCampaignRepository extends JpaRepository<EmailCampaign, Long> {
}
