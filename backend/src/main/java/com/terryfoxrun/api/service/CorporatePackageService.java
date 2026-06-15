package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.CorporatePackage;
import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.dto.CorporatePackageDto;
import com.terryfoxrun.api.repo.CorporatePackageRepository;
import com.terryfoxrun.api.repo.EventRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CorporatePackageService {
    private final EventRepository eventRepository;
    private final CorporatePackageRepository corporatePackageRepository;

    public CorporatePackageService(EventRepository eventRepository, CorporatePackageRepository corporatePackageRepository) {
        this.eventRepository = eventRepository;
        this.corporatePackageRepository = corporatePackageRepository;
    }

    @Transactional(readOnly = true)
    public List<CorporatePackageDto> list(Long eventId, boolean activeOnly) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        List<CorporatePackage> packages = activeOnly
                ? corporatePackageRepository.findByEventAndActiveTrueOrderByIdAsc(event)
                : corporatePackageRepository.findByEventOrderByIdAsc(event);
        return packages.stream().map(this::toDto).toList();
    }

    @Transactional
    public CorporatePackageDto create(Long eventId, CorporatePackageDto dto) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        CorporatePackage pkg = new CorporatePackage();
        pkg.setEvent(event);
        apply(dto, pkg);
        return toDto(corporatePackageRepository.save(pkg));
    }

    @Transactional
    public CorporatePackageDto update(Long packageId, CorporatePackageDto dto) {
        CorporatePackage pkg = corporatePackageRepository.findById(packageId).orElseThrow();
        apply(dto, pkg);
        return toDto(corporatePackageRepository.save(pkg));
    }

    @Transactional
    public void delete(Long packageId) {
        corporatePackageRepository.deleteById(packageId);
    }

    private void apply(CorporatePackageDto dto, CorporatePackage pkg) {
        pkg.setPackageName(dto.packageName());
        pkg.setPrice(dto.price());
        pkg.setTotalShirts(dto.totalShirts());
        pkg.setShirtAllocationRulesJson(dto.shirtAllocationRulesJson());
        pkg.setActive(dto.active());
    }

    private CorporatePackageDto toDto(CorporatePackage pkg) {
        return new CorporatePackageDto(
                pkg.getId(),
                pkg.getEvent().getId(),
                pkg.getPackageName(),
                pkg.getPrice(),
                pkg.getTotalShirts(),
                pkg.getShirtAllocationRulesJson(),
                pkg.isActive());
    }
}
