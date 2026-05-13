package com.terryfoxrun.api.service.storage;

import org.springframework.stereotype.Service;

@Service
public class ManualUrlStorageService implements StorageService {
    @Override
    public String normalizeProofReference(String proofReference) {
        if (proofReference == null) {
            return null;
        }
        String trimmed = proofReference.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
