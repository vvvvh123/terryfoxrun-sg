package com.terryfoxrun.api.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_movements")
public class InventoryMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private Registration registration;

    private String shirtType;
    private String size;
    private Integer quantityDelta;
    private String reason;
    private LocalDateTime createdAt;

    public static InventoryMovement create(Event event, Registration registration, String shirtType, String size, Integer quantityDelta, String reason) {
        InventoryMovement movement = new InventoryMovement();
        movement.setEvent(event);
        movement.setRegistration(registration);
        movement.setShirtType(shirtType);
        movement.setSize(size);
        movement.setQuantityDelta(quantityDelta);
        movement.setReason(reason);
        movement.setCreatedAt(LocalDateTime.now());
        return movement;
    }

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Registration getRegistration() {
        return registration;
    }

    public void setRegistration(Registration registration) {
        this.registration = registration;
    }

    public String getShirtType() {
        return shirtType;
    }

    public void setShirtType(String shirtType) {
        this.shirtType = shirtType;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Integer getQuantityDelta() {
        return quantityDelta;
    }

    public void setQuantityDelta(Integer quantityDelta) {
        this.quantityDelta = quantityDelta;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
