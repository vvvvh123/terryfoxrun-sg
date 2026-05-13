package com.terryfoxrun.api.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_campaigns")
public class EmailCampaign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    private String audience;
    private String subject;
    @Column(columnDefinition = "text")
    private String body;
    private String sentStatus;
    private String createdBy;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }
}
