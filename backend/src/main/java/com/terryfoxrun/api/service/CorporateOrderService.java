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
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.http.HttpStatus;

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
        CorporatePackage corporatePackage = null;
        if (request.corporatePackageId() != null) {
            corporatePackage = corporatePackageRepository.findById(request.corporatePackageId()).orElseThrow();
            int requestedTotal = request.items().stream()
                    .map(CorporateOrderRequest.Item::quantity)
                    .map(quantity -> quantity == null ? 0 : quantity)
                    .reduce(0, Integer::sum);
            int packageTotal = corporatePackage.getTotalShirts() == null ? 0 : corporatePackage.getTotalShirts();
            if (requestedTotal != packageTotal) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selected shirt quantities must add up to the package total of " + packageTotal + ".");
            }
        }
        for (CorporateOrderRequest.Item item : request.items()) {
            if (item.quantity() == null || item.quantity() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corporate shirt quantities cannot be negative.");
            }
            if (item.type() == null || item.type().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each corporate shirt allocation needs a shirt type.");
            }
        }
        CorporateOrder order = new CorporateOrder();
        order.setEvent(event);
        order.setCompanyName(request.companyName());
        order.setCompanyAddress(request.companyAddress());
        order.setUen(request.uen());
        order.setContactName(request.contactName());
        order.setContactEmail(request.contactEmail());
        order.setContactPhone(request.contactPhone());
        if (corporatePackage != null) {
            order.setCorporatePackage(corporatePackage);
        }
        order.setStatus("pending");
        order.setCreatedAt(LocalDateTime.now());
        corporateOrderRepository.save(order);

        for (CorporateOrderRequest.Item item : request.items()) {
            CorporateOrderItem it = new CorporateOrderItem();
            it.setCorporateOrder(order);
            it.setSize(item.size());
            it.setType(item.type().toLowerCase(Locale.ROOT));
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
