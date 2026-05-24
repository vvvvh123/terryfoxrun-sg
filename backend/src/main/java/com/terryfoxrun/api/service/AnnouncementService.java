package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.Announcement;
import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.dto.AnnouncementDto;
import com.terryfoxrun.api.dto.AnnouncementRequest;
import com.terryfoxrun.api.repo.AnnouncementRepository;
import com.terryfoxrun.api.repo.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class AnnouncementService {

    private final EventRepository eventRepository;
    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(EventRepository eventRepository, AnnouncementRepository announcementRepository) {
        this.eventRepository = eventRepository;
        this.announcementRepository = announcementRepository;
    }

    @Transactional(readOnly = true)
    public List<Announcement> list(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return announcementRepository.findByEventOrderByCreatedAtDesc(event);
    }

    @Transactional(readOnly = true)
    public List<AnnouncementDto> listDtos(Long eventId, boolean dashboardOnly) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        List<Announcement> announcements = dashboardOnly
                ? announcementRepository.findByEventAndChannelDashboardTrueOrderByCreatedAtDesc(event)
                : announcementRepository.findByEventOrderByCreatedAtDesc(event);
        return announcements.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<Announcement> listDashboard(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return announcementRepository.findByEventAndChannelDashboardTrueOrderByCreatedAtDesc(event);
    }

    @Transactional
    public Announcement create(Long eventId, String createdBy, AnnouncementRequest request) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        Announcement ann = new Announcement();
        ann.setEvent(event);
        ann.setTitle(request.title());
        ann.setBody(request.body());
        ann.setChannelEmail(request.channelEmail());
        ann.setChannelDashboard(request.channelDashboard());
        ann.setCreatedBy(createdBy);
        ann.setCreatedAt(LocalDateTime.now());
        return announcementRepository.save(ann);
    }

    @Transactional
    public AnnouncementDto createDto(Long eventId, String createdBy, AnnouncementRequest request) {
        return toDto(create(eventId, createdBy, request));
    }

    private AnnouncementDto toDto(Announcement announcement) {
        return new AnnouncementDto(
                announcement.getId(),
                announcement.getEvent().getId(),
                announcement.getTitle(),
                announcement.getBody(),
                announcement.isChannelEmail(),
                announcement.isChannelDashboard(),
                announcement.getCreatedBy(),
                announcement.getCreatedAt() == null ? null : announcement.getCreatedAt().toInstant(ZoneOffset.UTC));
    }
}
