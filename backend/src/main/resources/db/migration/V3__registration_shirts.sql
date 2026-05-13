CREATE TABLE registration_shirts (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT REFERENCES registrations(id) ON DELETE CASCADE,
    size TEXT,
    type TEXT,
    quantity INT,
    source TEXT
);

