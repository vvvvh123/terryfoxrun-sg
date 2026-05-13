package com.terryfoxrun.api.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "corporate_order_items")
public class CorporateOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "corporate_order_id")
    private CorporateOrder corporateOrder;

    private String size;
    private String type;
    private Integer quantity;

    public Long getId() {
        return id;
    }

    public CorporateOrder getCorporateOrder() {
        return corporateOrder;
    }

    public void setCorporateOrder(CorporateOrder corporateOrder) {
        this.corporateOrder = corporateOrder;
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}

