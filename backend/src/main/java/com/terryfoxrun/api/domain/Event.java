package com.terryfoxrun.api.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer year;

    @Column(name = "is_current")
    private boolean current;

    private String status;

    private LocalDateTime registrationOpen;
    private LocalDateTime registrationClose;
    private LocalDateTime eventStart;
    private LocalDateTime eventEnd;
    private LocalDateTime pickupStart;
    private LocalDateTime pickupEnd;

    private String locationEvent;
    private String locationPickup;

    @Column(columnDefinition = "jsonb")
    private String fieldFlagsJson;

    @Column(columnDefinition = "jsonb")
    private String donationPresetsJson;

    private Integer shirtPrice;

    @Column(columnDefinition = "jsonb")
    private String brandingJson;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Category> categories;

    public static Event createCurrent(String slug, String name, String location, Instant eventStart, Integer shirtPrice) {
        Event event = new Event();
        event.setName(name);
        event.setYear(eventStart.atZone(ZoneOffset.UTC).getYear());
        event.setCurrent(true);
        event.setStatus("open");
        event.setEventStart(LocalDateTime.ofInstant(eventStart, ZoneOffset.UTC));
        event.setLocationEvent(location);
        event.setLocationPickup(location);
        event.setShirtPrice(shirtPrice);
        event.setFieldFlagsJson("{}");
        event.setDonationPresetsJson("[]");
        event.setBrandingJson("{}");
        event.setCreatedAt(LocalDateTime.now());
        return event;
    }

    public Long getId() {
        return id;
    }

    public boolean isCurrent() {
        return current;
    }

    public void setCurrent(boolean current) {
        this.current = current;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRegistrationOpen() {
        return registrationOpen;
    }

    public void setRegistrationOpen(LocalDateTime registrationOpen) {
        this.registrationOpen = registrationOpen;
    }

    public LocalDateTime getRegistrationClose() {
        return registrationClose;
    }

    public void setRegistrationClose(LocalDateTime registrationClose) {
        this.registrationClose = registrationClose;
    }

    public LocalDateTime getEventStart() {
        return eventStart;
    }

    public void setEventStart(LocalDateTime eventStart) {
        this.eventStart = eventStart;
    }

    public LocalDateTime getEventEnd() {
        return eventEnd;
    }

    public void setEventEnd(LocalDateTime eventEnd) {
        this.eventEnd = eventEnd;
    }

    public LocalDateTime getPickupStart() {
        return pickupStart;
    }

    public void setPickupStart(LocalDateTime pickupStart) {
        this.pickupStart = pickupStart;
    }

    public LocalDateTime getPickupEnd() {
        return pickupEnd;
    }

    public void setPickupEnd(LocalDateTime pickupEnd) {
        this.pickupEnd = pickupEnd;
    }

    public String getLocationEvent() {
        return locationEvent;
    }

    public void setLocationEvent(String locationEvent) {
        this.locationEvent = locationEvent;
    }

    public String getLocationPickup() {
        return locationPickup;
    }

    public void setLocationPickup(String locationPickup) {
        this.locationPickup = locationPickup;
    }

    public String getFieldFlagsJson() {
        return fieldFlagsJson;
    }

    public void setFieldFlagsJson(String fieldFlagsJson) {
        this.fieldFlagsJson = fieldFlagsJson;
    }

    public String getDonationPresetsJson() {
        return donationPresetsJson;
    }

    public void setDonationPresetsJson(String donationPresetsJson) {
        this.donationPresetsJson = donationPresetsJson;
    }

    public Integer getShirtPrice() {
        return shirtPrice;
    }

    public void setShirtPrice(Integer shirtPrice) {
        this.shirtPrice = shirtPrice;
    }

    public String getBrandingJson() {
        return brandingJson;
    }

    public void setBrandingJson(String brandingJson) {
        this.brandingJson = brandingJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Category> getCategories() {
        return categories;
    }

    public void setCategories(List<Category> categories) {
        this.categories = categories;
    }
}
