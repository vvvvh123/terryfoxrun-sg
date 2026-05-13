package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.CorporateOrder;
import com.terryfoxrun.api.domain.CorporateOrderItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CorporateOrderItemRepository extends JpaRepository<CorporateOrderItem, Long> {
    List<CorporateOrderItem> findByCorporateOrder(CorporateOrder corporateOrder);
}
