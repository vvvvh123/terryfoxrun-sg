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
    public List<EventDto> listEvents() {
        return eventRepository.findAllByOrderByYearDescCreatedAtDesc().stream().map(this::toDto).toList();
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
    public EventDto copyEvent(Long sourceEventId) {
        Event source = eventRepository.findById(sourceEventId).orElseThrow();
        Event copy = new Event();
        copy.setName(source.getName() + " Copy");
        copy.setYear(Optional.ofNullable(source.getYear()).orElse(java.time.LocalDateTime.now().getYear()) + 1);
        copy.setCurrent(false);
        copy.setStatus("draft");
        copy.setRegistrationOpen(source.getRegistrationOpen());
        copy.setRegistrationClose(source.getRegistrationClose());
        copy.setEventStart(source.getEventStart());
        copy.setEventEnd(source.getEventEnd());
        copy.setPickupStart(source.getPickupStart());
        copy.setPickupEnd(source.getPickupEnd());
        copy.setLocationEvent(source.getLocationEvent());
        copy.setLocationPickup(source.getLocationPickup());
        copy.setFieldFlagsJson(source.getFieldFlagsJson());
        copy.setDonationPresetsJson(source.getDonationPresetsJson());
        copy.setShirtPrice(source.getShirtPrice());
        copy.setBrandingJson(source.getBrandingJson());
        copy.setPaymentInstructionsJson(source.getPaymentInstructionsJson());
        copy.setEventDetailsJson(source.getEventDetailsJson());
        copy.setFaqsJson(source.getFaqsJson());
        copy.setSocialLinksJson(source.getSocialLinksJson());
        copy.setContactRecipientEmail(source.getContactRecipientEmail());
        copy.setCreatedAt(java.time.LocalDateTime.now());
        eventRepository.save(copy);

        categoryRepository.findByEvent(source).forEach(category -> {
            Category clone = new Category();
            clone.setEvent(copy);
            clone.setName(category.getName());
            clone.setDescription(category.getDescription());
            clone.setBasePrice(category.getBasePrice());
            clone.setActive(category.isActive());
            categoryRepository.save(clone);
        });
        shirtInventoryRepository.findByEvent(source).forEach(item -> {
            ShirtInventory clone = new ShirtInventory();
            clone.setEvent(copy);
            clone.setType(item.getType());
            clone.setSize(item.getSize());
            clone.setQuantityAvailable(item.getQuantityAvailable());
            clone.setQuantityReserved(0);
            clone.setQuantitySold(0);
            shirtInventoryRepository.save(clone);
        });
        slideshowImageRepository.findByEventOrderByDisplayOrderAsc(source).forEach(slide -> {
            EventSlideshowImage clone = new EventSlideshowImage();
            clone.setEvent(copy);
            clone.setImageUrl(slide.getImageUrl());
            clone.setBlurb(slide.getBlurb());
            clone.setDisplayOrder(slide.getDisplayOrder());
            clone.setActive(slide.isActive());
            slideshowImageRepository.save(clone);
        });
        formFieldConfigRepository.findByEventOrderByDisplayOrderAsc(source).forEach(field -> {
            EventFormFieldConfig clone = new EventFormFieldConfig();
            clone.setEvent(copy);
            clone.setFieldKey(field.getFieldKey());
            clone.setLabel(field.getLabel());
            clone.setVisibility(field.getVisibility());
            clone.setAppliesTo(field.getAppliesTo());
            clone.setDisplayOrder(field.getDisplayOrder());
            formFieldConfigRepository.save(clone);
        });
        return toDto(copy);
    }

    @Transactional
    public EventDto setCurrentEvent(Long eventId) {
        Event selected = eventRepository.findById(eventId).orElseThrow();
        eventRepository.findAll().forEach(event -> {
            event.setCurrent(event.getId().equals(eventId));
            eventRepository.save(event);
        });
        selected.setCurrent(true);
        return toDto(selected);
    }

    @Transactional
    public void deleteEvent(Long eventId) {
        Event selected = eventRepository.findById(eventId).orElseThrow();
        boolean wasCurrent = selected.isCurrent();
        eventRepository.delete(selected);
        eventRepository.flush();
        if (wasCurrent) {
            eventRepository.findAllByOrderByYearDescCreatedAtDesc().stream().findFirst().ifPresent(next -> {
                next.setCurrent(true);
                eventRepository.save(next);
            });
        }
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
                fromJsonBranding(event.getBrandingJson()),
                fromJsonPaymentInstructions(event.getPaymentInstructionsJson()),
                fromJsonEventDetails(event.getEventDetailsJson()),
                fromJsonFaqs(event.getFaqsJson()),
                event.getContactRecipientEmail(),
                fromJsonSocialLinks(event.getSocialLinksJson())
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
        event.setPaymentInstructionsJson(toJson(dto.paymentInstructions()));
        event.setEventDetailsJson(toJson(dto.eventDetails()));
        event.setFaqsJson(toJson(dto.faqs()));
        event.setContactRecipientEmail(dto.contactRecipientEmail());
        event.setSocialLinksJson(toJson(dto.socialLinks()));
        if (event.getCreatedAt() == null) {
            event.setCreatedAt(java.time.LocalDateTime.now());
        }
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

    private EventDto.PaymentInstructionsDto fromJsonPaymentInstructions(String json) {
        if (json == null) return null;
        try {
            json = normalizeJson(json);
            return objectMapper.readValue(json, EventDto.PaymentInstructionsDto.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private EventDto.EventDetailsDto fromJsonEventDetails(String json) {
        if (json == null) return null;
        try {
            json = normalizeJson(json);
            return objectMapper.readValue(json, EventDto.EventDetailsDto.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private java.util.List<EventDto.FaqDto> fromJsonFaqs(String json) {
        if (json == null) return java.util.List.of();
        try {
            json = normalizeJson(json);
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(java.util.List.class, EventDto.FaqDto.class));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private EventDto.SocialLinksDto fromJsonSocialLinks(String json) {
        if (json == null) return null;
        try {
            json = normalizeJson(json);
            return objectMapper.readValue(json, EventDto.SocialLinksDto.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private String normalizeJson(String json) throws JsonProcessingException {
        String trimmed = json.trim();
        while (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            trimmed = objectMapper.readValue(trimmed, String.class).trim();
        }
        return trimmed;
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
