package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.EventFormFieldConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventFormFieldConfigRepository extends JpaRepository<EventFormFieldConfig, Long> {
    List<EventFormFieldConfig> findByEventOrderByDisplayOrderAsc(Event event);
}
