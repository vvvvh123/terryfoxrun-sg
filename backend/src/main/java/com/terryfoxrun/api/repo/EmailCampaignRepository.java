package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.EmailCampaign;
import com.terryfoxrun.api.domain.Event;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailCampaignRepository extends JpaRepository<EmailCampaign, Long> {
    List<EmailCampaign> findByEventOrderByCreatedAtDesc(Event event);
}
