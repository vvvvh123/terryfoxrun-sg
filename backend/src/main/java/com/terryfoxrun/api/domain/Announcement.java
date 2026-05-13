package com.terryfoxrun.api.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    private String title;
    @Column(columnDefinition = "text")
    private String body;
    private boolean channelEmail;
    private boolean channelDashboard;
    private String createdBy;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public boolean isChannelEmail() {
        return channelEmail;
    }

    public void setChannelEmail(boolean channelEmail) {
        this.channelEmail = channelEmail;
    }

    public boolean isChannelDashboard() {
        return channelDashboard;
    }

    public void setChannelDashboard(boolean channelDashboard) {
        this.channelDashboard = channelDashboard;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

