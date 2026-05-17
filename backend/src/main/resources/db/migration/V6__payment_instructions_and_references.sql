ALTER TABLE events ADD COLUMN payment_instructions_json JSONB;

UPDATE events
SET payment_instructions_json = '{
  "payNowQrImageUrl": "/paynow-placeholder.svg",
  "payNowInstruction": "Scan the PayNow QR code and enter your Terry Fox Run reference in the payment comments.",
  "bankName": "DBS Bank Pte Ltd",
  "bankAccountNumber": "123-456-7890",
  "bankAccountName": "Terry Fox Run Singapore",
  "bankInstruction": "Transfer the exact amount and enter your Terry Fox Run reference in the transfer comments.",
  "proofBucket": "payment-proofs"
}';

CREATE UNIQUE INDEX idx_registrations_generated_payment_reference_unique
ON registrations(generated_payment_reference);
