package com.terryfoxrun.api.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "shirt_inventory")
public class ShirtInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    private String size;
    private String type;
    private Integer quantityAvailable;
    private Integer quantityReserved;
    private Integer quantitySold;

    public static ShirtInventory create(Event event, String type, String size, int quantityAvailable) {
        ShirtInventory inventory = new ShirtInventory();
        inventory.setEvent(event);
        inventory.setType(type);
        inventory.setSize(size);
        inventory.setQuantityAvailable(quantityAvailable);
        inventory.setQuantityReserved(0);
        inventory.setQuantitySold(0);
        return inventory;
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

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getQuantityAvailable() {
        return quantityAvailable;
    }

    public void setQuantityAvailable(Integer quantityAvailable) {
        this.quantityAvailable = quantityAvailable;
    }

    public Integer getQuantityReserved() {
        return quantityReserved;
    }

    public void setQuantityReserved(Integer quantityReserved) {
        this.quantityReserved = quantityReserved;
    }

    public Integer getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(Integer quantitySold) {
        this.quantitySold = quantitySold;
    }
}
