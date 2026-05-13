INSERT INTO events (name, year, is_current, status, registration_open, registration_close, event_start, event_end, pickup_start, pickup_end, location_event, location_pickup, field_flags_json, donation_presets_json, shirt_price, branding_json)
VALUES (
    'Terry Fox Run SG',
    2025,
    TRUE,
    'open',
    '2025-08-01 00:00:00+08:00',
    '2025-11-21 23:59:00+08:00',
    '2025-11-30 07:00:00+08:00',
    '2025-11-30 11:00:00+08:00',
    '2025-11-22 10:00:00+08:00',
    '2025-11-23 18:00:00+08:00',
    'TBD, Singapore',
    'TBD, Singapore',
    '{"requireAddress": true, "requireNricLast4": true, "requireEmergencyContact": true, "requireDob": true, "requireGender": true, "allowMedicalNotes": true, "allowShirtPurchase": true, "allowDonation": true, "allowCorporate": true}',
    '[20,50,100]',
    3500,
    '{"primary":"#d90429","secondary":"#0b0c10","accent":"#ffffff"}'
);

-- Seed categories
INSERT INTO categories (event_id, name, description, base_price, active)
SELECT id, '5K Fun Run', '5K route', 0, TRUE FROM events WHERE is_current = TRUE;
INSERT INTO categories (event_id, name, description, base_price, active)
SELECT id, '10K Fun Run', '10K route', 0, TRUE FROM events WHERE is_current = TRUE;

-- Seed shirt sizes with quantities (adjust later in admin)
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'XS', 'adult', 100, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'S', 'adult', 150, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'M', 'adult', 200, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'L', 'adult', 200, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'XL', 'adult', 150, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'XXL', 'adult', 80, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'XXXL', 'adult', 50, 0, 0 FROM events WHERE is_current = TRUE;

INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'XS', 'kid', 80, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'S', 'kid', 80, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'M', 'kid', 80, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'L', 'kid', 80, 0, 0 FROM events WHERE is_current = TRUE;
