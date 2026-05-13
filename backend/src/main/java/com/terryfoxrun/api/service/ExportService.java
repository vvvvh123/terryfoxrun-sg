package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.CorporateOrder;
import com.terryfoxrun.api.domain.CorporateOrderItem;
import com.terryfoxrun.api.domain.PaymentAttempt;
import com.terryfoxrun.api.domain.Registration;
import com.terryfoxrun.api.domain.ShirtInventory;
import com.terryfoxrun.api.repo.CorporateOrderItemRepository;
import com.terryfoxrun.api.repo.CorporateOrderRepository;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.PaymentAttemptRepository;
import com.terryfoxrun.api.repo.RegistrationRepository;
import com.terryfoxrun.api.repo.ShirtInventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class ExportService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final CorporateOrderRepository corporateOrderRepository;
    private final CorporateOrderItemRepository corporateOrderItemRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final ShirtInventoryRepository shirtInventoryRepository;

    public ExportService(EventRepository eventRepository,
                         RegistrationRepository registrationRepository,
                         CorporateOrderRepository corporateOrderRepository,
                         CorporateOrderItemRepository corporateOrderItemRepository,
                         PaymentAttemptRepository paymentAttemptRepository,
                         ShirtInventoryRepository shirtInventoryRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.corporateOrderRepository = corporateOrderRepository;
        this.corporateOrderItemRepository = corporateOrderItemRepository;
        this.paymentAttemptRepository = paymentAttemptRepository;
        this.shirtInventoryRepository = shirtInventoryRepository;
    }

    @Transactional(readOnly = true)
    public byte[] registrationsCsv(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        List<Registration> regs = registrationRepository.findByEvent(event);
        StringBuilder sb = new StringBuilder("registration_id,payer_name,payer_email,total_amount,payment_status,created_at\n");
        regs.forEach(r -> sb.append(r.getId()).append(",")
                .append(csv(r.getPayerName())).append(",")
                .append(csv(r.getPayerEmail())).append(",")
                .append(r.getTotalAmount()).append(",")
                .append(csv(r.getPaymentStatus())).append(",")
                .append(r.getCreatedAt()).append("\n"));
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Transactional(readOnly = true)
    public byte[] corporateCsv(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        StringBuilder sb = new StringBuilder("corporate_order_id,company_name,uen,contact_email,status,shirt_type,size,quantity\n");
        for (CorporateOrder order : corporateOrderRepository.findByEvent(event)) {
            List<CorporateOrderItem> items = corporateOrderItemRepository.findByCorporateOrder(order);
            if (items.isEmpty()) {
                sb.append(order.getId()).append(",")
                        .append(csv(order.getCompanyName())).append(",")
                        .append(csv(order.getUen())).append(",")
                        .append(csv(order.getContactEmail())).append(",")
                        .append(csv(order.getStatus())).append(",,,,\n");
            }
            for (CorporateOrderItem item : items) {
                sb.append(order.getId()).append(",")
                        .append(csv(order.getCompanyName())).append(",")
                        .append(csv(order.getUen())).append(",")
                        .append(csv(order.getContactEmail())).append(",")
                        .append(csv(order.getStatus())).append(",")
                        .append(csv(item.getType())).append(",")
                        .append(csv(item.getSize())).append(",")
                        .append(item.getQuantity()).append("\n");
            }
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Transactional(readOnly = true)
    public byte[] financeCsv(Long eventId) {
        StringBuilder sb = new StringBuilder("payment_attempt_id,registration_id,payer_email,method,generated_reference,user_transaction_id,verification_status,total_amount\n");
        for (PaymentAttempt attempt : paymentAttemptRepository.findAll()) {
            Registration registration = attempt.getRegistration();
            if (!registration.getEvent().getId().equals(eventId)) {
                continue;
            }
            sb.append(attempt.getId()).append(",")
                    .append(registration.getId()).append(",")
                    .append(csv(registration.getPayerEmail())).append(",")
                    .append(attempt.getMethod()).append(",")
                    .append(csv(attempt.getGeneratedReference())).append(",")
                    .append(csv(attempt.getUserTransactionId())).append(",")
                    .append(csv(attempt.getVerificationStatus())).append(",")
                    .append(registration.getTotalAmount()).append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Transactional(readOnly = true)
    public byte[] inventoryCsv(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        StringBuilder sb = new StringBuilder("shirt_type,size,quantity_available,quantity_reserved,quantity_sold\n");
        for (ShirtInventory item : shirtInventoryRepository.findByEvent(event)) {
            sb.append(csv(item.getType())).append(",")
                    .append(csv(item.getSize())).append(",")
                    .append(item.getQuantityAvailable()).append(",")
                    .append(item.getQuantityReserved()).append(",")
                    .append(item.getQuantitySold()).append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String csv(Object value) {
        if (value == null) {
            return "";
        }
        String text = value.toString();
        if (text.contains(",") || text.contains("\"") || text.contains("\n")) {
            return "\"" + text.replace("\"", "\"\"") + "\"";
        }
        return text;
    }
}
