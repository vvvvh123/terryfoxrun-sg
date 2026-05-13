CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    year INT,
    is_current BOOLEAN DEFAULT FALSE,
    status TEXT,
    registration_open TIMESTAMPTZ,
    registration_close TIMESTAMPTZ,
    event_start TIMESTAMPTZ,
    event_end TIMESTAMPTZ,
    pickup_start TIMESTAMPTZ,
    pickup_end TIMESTAMPTZ,
    location_event TEXT,
    location_pickup TEXT,
    field_flags_json JSONB,
    donation_presets_json JSONB,
    shirt_price INT,
    branding_json JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    base_price INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE registrations (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    payer_user_id TEXT,
    total_amount INT,
    payment_status TEXT,
    stripe_session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE registration_participants (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT REFERENCES registrations(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id),
    name TEXT,
    email TEXT,
    phone TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    dob TEXT,
    gender TEXT,
    address TEXT,
    nric_last4 TEXT,
    medical_notes TEXT,
    tshirt_size TEXT,
    tshirt_type TEXT,
    tshirt_qty INT,
    pickup_token TEXT,
    pickup_code TEXT,
    pickup_status TEXT,
    pickup_timestamp TIMESTAMPTZ
);

CREATE TABLE donations (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT REFERENCES registrations(id) ON DELETE CASCADE,
    amount INT
);

CREATE TABLE shirt_inventory (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    size TEXT,
    type TEXT,
    quantity_available INT DEFAULT 0,
    quantity_reserved INT DEFAULT 0,
    quantity_sold INT DEFAULT 0
);

CREATE TABLE corporate_orders (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    company_name TEXT,
    company_address TEXT,
    uen TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE corporate_order_items (
    id BIGSERIAL PRIMARY KEY,
    corporate_order_id BIGINT REFERENCES corporate_orders(id) ON DELETE CASCADE,
    size TEXT,
    type TEXT,
    quantity INT
);

CREATE TABLE announcements (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    title TEXT,
    body TEXT,
    channel_email BOOLEAN DEFAULT FALSE,
    channel_dashboard BOOLEAN DEFAULT FALSE,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT REFERENCES registrations(id) ON DELETE CASCADE,
    amount INT,
    currency TEXT,
    status TEXT,
    provider TEXT,
    provider_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_current ON events(is_current);
CREATE INDEX idx_categories_event ON categories(event_id);
CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_payer ON registrations(payer_user_id);
CREATE INDEX idx_participants_registration ON registration_participants(registration_id);
CREATE INDEX idx_shirt_inventory_event ON shirt_inventory(event_id);
CREATE INDEX idx_corporate_orders_event ON corporate_orders(event_id);
CREATE INDEX idx_announcements_event ON announcements(event_id);

