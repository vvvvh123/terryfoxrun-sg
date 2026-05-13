package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Announcement;
import com.terryfoxrun.api.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByEventOrderByCreatedAtDesc(Event event);
}

