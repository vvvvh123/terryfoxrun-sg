ALTER TABLE registration_participants ADD COLUMN pickup_collected_by TEXT;
ALTER TABLE email_campaigns ADD COLUMN sent_at TIMESTAMPTZ;
