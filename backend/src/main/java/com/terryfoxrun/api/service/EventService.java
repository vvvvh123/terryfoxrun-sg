package com.terryfoxrun.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.terryfoxrun.api.domain.Category;
import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.EventFormFieldConfig;
import com.terryfoxrun.api.domain.EventSlideshowImage;
import com.terryfoxrun.api.domain.ShirtInventory;
import com.terryfoxrun.api.dto.CategoryDto;
import com.terryfoxrun.api.dto.EventDto;
import com.terryfoxrun.api.dto.EventFormFieldConfigDto;
import com.terryfoxrun.api.dto.EventSlideshowImageDto;
import com.terryfoxrun.api.repo.CategoryRepository;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.EventFormFieldConfigRepository;
import com.terryfoxrun.api.repo.EventSlideshowImageRepository;
import com.terryfoxrun.api.repo.ShirtInventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final ShirtInventoryRepository shirtInventoryRepository;
    private final EventSlideshowImageRepository slideshowImageRepository;
    private final EventFormFieldConfigRepository formFieldConfigRepository;
    private final ObjectMapper objectMapper;

    public EventService(EventRepository eventRepository,
                        CategoryRepository categoryRepository,
                        ShirtInventoryRepository shirtInventoryRepository,
                        EventSlideshowImageRepository slideshowImageRepository,
                        EventFormFieldConfigRepository formFieldConfigRepository,
                        ObjectMapper objectMapper) {
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
        this.shirtInventoryRepository = shirtInventoryRepository;
        this.slideshowImageRepository = slideshowImageRepository;
        this.formFieldConfigRepository = formFieldConfigRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Optional<EventDto> getCurrentEvent() {
        return eventRepository.findFirstByCurrentTrue().map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<EventDto> getEvent(Long id) {
        return eventRepository.findById(id).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategories(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return categoryRepository.findByEvent(event).stream().map(this::toDto).toList();
    }

    @Transactional
    public EventDto createOrUpdate(Long id, EventDto dto) {
        Event event = id == null ? new Event() : eventRepository.findById(id).orElse(new Event());
        applyToEntity(dto, event);
        eventRepository.save(event);

        // Replace shirt inventory for this event
        shirtInventoryRepository.findByEvent(event).forEach(shirtInventoryRepository::delete);
        if (dto.shirtSizes() != null) {
            for (EventDto.ShirtSizeDto s : dto.shirtSizes()) {
                ShirtInventory inv = new ShirtInventory();
                inv.setEvent(event);
                inv.setSize(s.size());
                inv.setType(s.type());
                inv.setQuantityAvailable(s.quantityAvailable());
                inv.setQuantityReserved(0);
                inv.setQuantitySold(0);
                shirtInventoryRepository.save(inv);
            }
        }
        return toDto(event);
    }

    @Transactional
    public CategoryDto createCategory(Long eventId, CategoryDto dto) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        Category cat = new Category();
        cat.setEvent(event);
        cat.setName(dto.name());
        cat.setDescription(dto.description());
        cat.setBasePrice(dto.basePrice());
        cat.setActive(dto.isActive());
        categoryRepository.save(cat);
        return toDto(cat);
    }

    @Transactional(readOnly = true)
    public List<EventSlideshowImageDto> getSlideshowImages(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return slideshowImageRepository.findByEventAndActiveTrueOrderByDisplayOrderAsc(event).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public List<EventSlideshowImageDto> replaceSlideshowImages(Long eventId, List<EventSlideshowImageDto> images) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        slideshowImageRepository.findByEventOrderByDisplayOrderAsc(event).forEach(slideshowImageRepository::delete);
        for (EventSlideshowImageDto dto : images) {
            EventSlideshowImage image = new EventSlideshowImage();
            image.setEvent(event);
            image.setImageUrl(dto.imageUrl());
            image.setBlurb(dto.blurb());
            image.setDisplayOrder(dto.displayOrder());
            image.setActive(dto.active());
            slideshowImageRepository.save(image);
        }
        return getSlideshowImages(eventId);
    }

    @Transactional(readOnly = true)
    public List<EventFormFieldConfigDto> getFormFields(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return formFieldConfigRepository.findByEventOrderByDisplayOrderAsc(event).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public List<EventFormFieldConfigDto> replaceFormFields(Long eventId, List<EventFormFieldConfigDto> fields) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        formFieldConfigRepository.findByEventOrderByDisplayOrderAsc(event).forEach(formFieldConfigRepository::delete);
        for (EventFormFieldConfigDto dto : fields) {
            EventFormFieldConfig field = new EventFormFieldConfig();
            field.setEvent(event);
            field.setFieldKey(dto.fieldKey());
            field.setLabel(dto.label());
            field.setVisibility(dto.visibility());
            field.setAppliesTo(dto.appliesTo());
            field.setDisplayOrder(dto.displayOrder());
            formFieldConfigRepository.save(field);
        }
        return getFormFields(eventId);
    }

    private EventDto toDto(Event event) {
        List<EventDto.ShirtSizeDto> sizes = shirtInventoryRepository.findByEvent(event).stream()
                .map(inv -> new EventDto.ShirtSizeDto(inv.getType(), inv.getSize(), inv.getQuantityAvailable()))
                .toList();
        return new EventDto(
                event.getId(),
                event.getName(),
                event.getYear(),
                event.isCurrent(),
                event.getStatus(),
                toInstant(event.getRegistrationOpen()),
                toInstant(event.getRegistrationClose()),
                toInstant(event.getEventStart()),
                toInstant(event.getEventEnd()),
                toInstant(event.getPickupStart()),
                toInstant(event.getPickupEnd()),
                event.getLocationEvent(),
                event.getLocationPickup(),
                fromJsonMap(event.getFieldFlagsJson()),
                fromJsonList(event.getDonationPresetsJson()),
                event.getShirtPrice(),
                sizes,
                fromJsonBranding(event.getBrandingJson())
        );
    }

    private CategoryDto toDto(Category cat) {
        return new CategoryDto(cat.getId(), cat.getEvent().getId(), cat.getName(), cat.getDescription(), cat.getBasePrice(), cat.isActive());
    }

    private EventSlideshowImageDto toDto(EventSlideshowImage image) {
        return new EventSlideshowImageDto(
                image.getId(),
                image.getImageUrl(),
                image.getBlurb(),
                image.getDisplayOrder(),
                image.isActive());
    }

    private EventFormFieldConfigDto toDto(EventFormFieldConfig field) {
        return new EventFormFieldConfigDto(
                field.getId(),
                field.getFieldKey(),
                field.getLabel(),
                field.getVisibility(),
                field.getAppliesTo(),
                field.getDisplayOrder());
    }

    private void applyToEntity(EventDto dto, Event event) {
        event.setName(dto.name());
        event.setYear(dto.year());
        event.setCurrent(dto.isCurrent());
        event.setStatus(dto.status());
        event.setRegistrationOpen(fromInstant(dto.registrationOpen()));
        event.setRegistrationClose(fromInstant(dto.registrationClose()));
        event.setEventStart(fromInstant(dto.eventStart()));
        event.setEventEnd(fromInstant(dto.eventEnd()));
        event.setPickupStart(fromInstant(dto.pickupStart()));
        event.setPickupEnd(fromInstant(dto.pickupEnd()));
        event.setLocationEvent(dto.locationEvent());
        event.setLocationPickup(dto.locationPickup());
        event.setFieldFlagsJson(toJson(dto.fieldFlags()));
        event.setDonationPresetsJson(toJson(dto.donationPresets()));
        event.setShirtPrice(dto.shirtPrice());
        event.setBrandingJson(toJson(dto.branding()));
    }

    private java.time.LocalDateTime fromInstant(java.time.Instant instant) {
        return instant == null ? null : java.time.LocalDateTime.ofInstant(instant, java.time.ZoneId.systemDefault());
    }

    private java.time.Instant toInstant(java.time.LocalDateTime dt, boolean utc) {
        return dt == null ? null : dt.atZone(java.time.ZoneOffset.UTC).toInstant();
    }

    private java.time.Instant toInstant(java.time.LocalDateTime dt) {
        return toInstant(dt, false);
    }

    private java.util.Map<String, Object> fromJsonMap(String json) {
        if (json == null) return null;
        try {
            json = normalizeJson(json);
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructMapType(java.util.Map.class, String.class, Object.class));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private java.util.List<Integer> fromJsonList(String json) {
        if (json == null) return null;
        try {
            json = normalizeJson(json);
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(java.util.List.class, Integer.class));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private EventDto.BrandingDto fromJsonBranding(String json) {
        if (json == null) return null;
        try {
            json = normalizeJson(json);
            return objectMapper.readValue(json, EventDto.BrandingDto.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private String normalizeJson(String json) throws JsonProcessingException {
        String trimmed = json.trim();
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            return objectMapper.readValue(trimmed, String.class);
        }
        return json;
    }

    private String toJson(Object value) {
        if (value == null) return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
