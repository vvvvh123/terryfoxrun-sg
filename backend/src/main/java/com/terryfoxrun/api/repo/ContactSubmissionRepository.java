package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.ContactSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactSubmissionRepository extends JpaRepository<ContactSubmission, Long> {
}
