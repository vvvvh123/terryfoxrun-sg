package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.CorporateOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CorporateOrderItemRepository extends JpaRepository<CorporateOrderItem, Long> {
}

