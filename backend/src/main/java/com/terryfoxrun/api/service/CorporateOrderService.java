package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.CorporateOrder;
import com.terryfoxrun.api.domain.CorporateOrderItem;
import com.terryfoxrun.api.domain.CorporatePackage;
import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.dto.CorporateOrderDto;
import com.terryfoxrun.api.dto.CorporateOrderRequest;
import com.terryfoxrun.api.repo.CorporateOrderItemRepository;
import com.terryfoxrun.api.repo.CorporateOrderRepository;
import com.terryfoxrun.api.repo.CorporatePackageRepository;
import com.terryfoxrun.api.repo.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class CorporateOrderService {

    private final EventRepository eventRepository;
    private final CorporateOrderRepository corporateOrderRepository;
    private final CorporateOrderItemRepository corporateOrderItemRepository;
    private final CorporatePackageRepository corporatePackageRepository;

    public CorporateOrderService(EventRepository eventRepository,
                                 CorporateOrderRepository corporateOrderRepository,
                                 CorporateOrderItemRepository corporateOrderItemRepository,
                                 CorporatePackageRepository corporatePackageRepository) {
        this.eventRepository = eventRepository;
        this.corporateOrderRepository = corporateOrderRepository;
        this.corporateOrderItemRepository = corporateOrderItemRepository;
        this.corporatePackageRepository = corporatePackageRepository;
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
        if (request.corporatePackageId() != null) {
            order.setCorporatePackage(corporatePackageRepository.findById(request.corporatePackageId()).orElseThrow());
        }
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
    public List<CorporateOrderDto> listDtos(Long eventId) {
        return list(eventId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public CorporateOrder get(Long id) {
        return corporateOrderRepository.findById(id).orElseThrow();
    }

    @Transactional(readOnly = true)
    public CorporateOrderDto getDto(Long id) {
        return toDto(get(id));
    }

    @Transactional
    public CorporateOrder updateStatus(Long id, String status) {
        CorporateOrder order = corporateOrderRepository.findById(id).orElseThrow();
        order.setStatus(status);
        return corporateOrderRepository.save(order);
    }

    @Transactional
    public CorporateOrderDto updateStatusDto(Long id, String status) {
        return toDto(updateStatus(id, status));
    }

    private CorporateOrderDto toDto(CorporateOrder order) {
        return new CorporateOrderDto(
                order.getId(),
                order.getEvent().getId(),
                order.getCompanyName(),
                order.getCompanyAddress(),
                order.getUen(),
                order.getContactName(),
                order.getContactEmail(),
                order.getContactPhone(),
                order.getCorporatePackage() == null ? null : order.getCorporatePackage().getId(),
                order.getCorporatePackage() == null ? null : order.getCorporatePackage().getPackageName(),
                order.getStatus(),
                order.getCreatedAt() == null ? null : order.getCreatedAt().toInstant(ZoneOffset.UTC),
                order.getItems() == null ? List.of() : order.getItems().stream()
                        .map(item -> new CorporateOrderDto.Item(item.getId(), item.getSize(), item.getType(), item.getQuantity()))
                        .toList());
    }
}
