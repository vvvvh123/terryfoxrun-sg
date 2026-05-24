package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.CorporatePackage;
import com.terryfoxrun.api.domain.Event;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CorporatePackageRepository extends JpaRepository<CorporatePackage, Long> {
    List<CorporatePackage> findByEventOrderByIdAsc(Event event);

    List<CorporatePackage> findByEventAndActiveTrueOrderByIdAsc(Event event);
}
