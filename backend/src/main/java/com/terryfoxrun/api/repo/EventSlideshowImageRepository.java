package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.EventSlideshowImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventSlideshowImageRepository extends JpaRepository<EventSlideshowImage, Long> {
    List<EventSlideshowImage> findByEventAndActiveTrueOrderByDisplayOrderAsc(Event event);
    List<EventSlideshowImage> findByEventOrderByDisplayOrderAsc(Event event);
}
