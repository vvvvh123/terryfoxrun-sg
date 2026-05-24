ALTER TABLE registration_shirts ADD COLUMN participant_id BIGINT REFERENCES registration_participants(id) ON DELETE CASCADE;
ALTER TABLE corporate_orders ADD COLUMN corporate_package_id BIGINT REFERENCES corporate_packages(id);

CREATE INDEX idx_registration_shirts_participant ON registration_shirts(participant_id);
