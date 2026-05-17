package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.CategoryDto;
import com.terryfoxrun.api.dto.EventDto;
import com.terryfoxrun.api.dto.EventFormFieldConfigDto;
import com.terryfoxrun.api.dto.EventSlideshowImageDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final com.terryfoxrun.api.service.EventService eventService;

    public EventController(com.terryfoxrun.api.service.EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<EventDto>> listEvents() {
        return ResponseEntity.ok(eventService.listEvents());
    }

    @GetMapping("/current")
    public ResponseEntity<EventDto> getCurrentEvent() {
        return eventService.getCurrentEvent()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEvent(@PathVariable Long id) {
        return eventService.getEvent(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/categories")
    public ResponseEntity<List<CategoryDto>> getCategories(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getCategories(id));
    }

    @GetMapping("/{id}/slideshow")
    public ResponseEntity<List<EventSlideshowImageDto>> getSlideshow(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getSlideshowImages(id));
    }

    @PutMapping("/{id}/slideshow")
    public ResponseEntity<List<EventSlideshowImageDto>> replaceSlideshow(@PathVariable Long id,
                                                                         @RequestBody List<EventSlideshowImageDto> request) {
        return ResponseEntity.ok(eventService.replaceSlideshowImages(id, request));
    }

    @GetMapping("/{id}/form-fields")
    public ResponseEntity<List<EventFormFieldConfigDto>> getFormFields(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getFormFields(id));
    }

    @PutMapping("/{id}/form-fields")
    public ResponseEntity<List<EventFormFieldConfigDto>> replaceFormFields(@PathVariable Long id,
                                                                          @RequestBody List<EventFormFieldConfigDto> request) {
        return ResponseEntity.ok(eventService.replaceFormFields(id, request));
    }

    @PostMapping
    public ResponseEntity<EventDto> createEvent(@RequestBody EventDto request) {
        return ResponseEntity.ok(eventService.createOrUpdate(null, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(@PathVariable Long id, @RequestBody EventDto request) {
        return ResponseEntity.ok(eventService.createOrUpdate(id, request));
    }

    @PostMapping("/{id}/copy")
    public ResponseEntity<EventDto> copyEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.copyEvent(id));
    }

    @PatchMapping("/{id}/current")
    public ResponseEntity<EventDto> setCurrentEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.setCurrentEvent(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
