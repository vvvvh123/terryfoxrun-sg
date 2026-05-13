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
}
