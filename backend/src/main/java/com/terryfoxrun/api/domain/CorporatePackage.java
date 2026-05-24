package com.terryfoxrun.api.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "corporate_packages")
public class CorporatePackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    private String packageName;
    private Integer price;
    @Column(columnDefinition = "jsonb")
    private String shirtAllocationRulesJson;
    private boolean active;

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public String getShirtAllocationRulesJson() {
        return shirtAllocationRulesJson;
    }

    public void setShirtAllocationRulesJson(String shirtAllocationRulesJson) {
        this.shirtAllocationRulesJson = shirtAllocationRulesJson;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
