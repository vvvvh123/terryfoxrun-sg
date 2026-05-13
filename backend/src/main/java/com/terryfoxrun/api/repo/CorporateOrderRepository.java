package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.CorporateOrder;
import com.terryfoxrun.api.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CorporateOrderRepository extends JpaRepository<CorporateOrder, Long> {
    List<CorporateOrder> findByEvent(Event event);
}

