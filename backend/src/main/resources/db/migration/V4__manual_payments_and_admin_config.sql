ALTER TABLE registrations ADD COLUMN payer_name TEXT;
ALTER TABLE registrations ADD COLUMN payer_email TEXT;
ALTER TABLE registrations ADD COLUMN payer_identity_number TEXT;
ALTER TABLE registrations ADD COLUMN payer_address TEXT;
ALTER TABLE registrations ADD COLUMN payer_blood_type TEXT;
ALTER TABLE registrations ADD COLUMN status TEXT;
ALTER TABLE registrations ADD COLUMN generated_payment_reference TEXT;
ALTER TABLE registrations ADD COLUMN indemnity_accepted BOOLEAN DEFAULT FALSE;

CREATE TABLE payment_attempts (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT REFERENCES registrations(id) ON DELETE CASCADE,
    method TEXT,
    generated_reference TEXT,
    user_transaction_id TEXT,
    proof_file_url TEXT,
    verification_status TEXT,
    admin_transaction_id TEXT,
    verified_by TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    verified_at TIMESTAMPTZ
);

CREATE TABLE inventory_movements (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    registration_id BIGINT REFERENCES registrations(id) ON DELETE SET NULL,
    shirt_type TEXT,
    size TEXT,
    quantity_delta INT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE event_slideshow_images (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    image_url TEXT,
    blurb TEXT,
    display_order INT,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE event_form_field_configs (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    field_key TEXT,
    label TEXT,
    visibility TEXT,
    applies_to TEXT,
    display_order INT
);

CREATE TABLE corporate_packages (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    package_name TEXT,
    price INT,
    shirt_allocation_rules_json JSONB,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE email_campaigns (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    audience TEXT,
    subject TEXT,
    body TEXT,
    sent_status TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payment_attempts_registration ON payment_attempts(registration_id);
CREATE INDEX idx_inventory_movements_event_created ON inventory_movements(event_id, created_at);
CREATE INDEX idx_inventory_movements_registration ON inventory_movements(registration_id);
CREATE INDEX idx_event_slideshow_images_event ON event_slideshow_images(event_id);
CREATE INDEX idx_event_form_field_configs_event ON event_form_field_configs(event_id);
CREATE INDEX idx_email_campaigns_event ON email_campaigns(event_id);
