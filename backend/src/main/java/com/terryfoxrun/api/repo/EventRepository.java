package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    Optional<Event> findFirstByCurrentTrue();
    List<Event> findAllByOrderByYearDescCreatedAtDesc();
}
