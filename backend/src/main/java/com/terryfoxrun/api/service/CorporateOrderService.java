package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.CorporateOrder;
import com.terryfoxrun.api.domain.CorporateOrderItem;
import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.dto.CorporateOrderRequest;
import com.terryfoxrun.api.repo.CorporateOrderItemRepository;
import com.terryfoxrun.api.repo.CorporateOrderRepository;
import com.terryfoxrun.api.repo.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CorporateOrderService {

    private final EventRepository eventRepository;
    private final CorporateOrderRepository corporateOrderRepository;
    private final CorporateOrderItemRepository corporateOrderItemRepository;

    public CorporateOrderService(EventRepository eventRepository,
                                 CorporateOrderRepository corporateOrderRepository,
                                 CorporateOrderItemRepository corporateOrderItemRepository) {
        this.eventRepository = eventRepository;
        this.corporateOrderRepository = corporateOrderRepository;
        this.corporateOrderItemRepository = corporateOrderItemRepository;
    }

    @Transactional
    public CorporateOrder create(CorporateOrderRequest request) {
        Event event = eventRepository.findById(request.eventId()).orElseThrow();
        CorporateOrder order = new CorporateOrder();
        order.setEvent(event);
        order.setCompanyName(request.companyName());
        order.setCompanyAddress(request.companyAddress());
        order.setUen(request.uen());
        order.setContactName(request.contactName());
        order.setContactEmail(request.contactEmail());
        order.setContactPhone(request.contactPhone());
        order.setStatus("pending");
        order.setCreatedAt(LocalDateTime.now());
        corporateOrderRepository.save(order);

        for (CorporateOrderRequest.Item item : request.items()) {
            CorporateOrderItem it = new CorporateOrderItem();
            it.setCorporateOrder(order);
            it.setSize(item.size());
            it.setType(item.type());
            it.setQuantity(item.quantity());
            corporateOrderItemRepository.save(it);
        }
        return order;
    }

    @Transactional(readOnly = true)
    public List<CorporateOrder> list(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return corporateOrderRepository.findByEvent(event);
    }

    @Transactional(readOnly = true)
    public CorporateOrder get(Long id) {
        return corporateOrderRepository.findById(id).orElseThrow();
    }

    @Transactional
    public CorporateOrder updateStatus(Long id, String status) {
        CorporateOrder order = corporateOrderRepository.findById(id).orElseThrow();
        order.setStatus(status);
        return corporateOrderRepository.save(order);
    }
}

