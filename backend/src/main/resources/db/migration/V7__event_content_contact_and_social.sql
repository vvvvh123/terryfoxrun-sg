ALTER TABLE events ADD COLUMN event_details_json JSONB;
ALTER TABLE events ADD COLUMN faqs_json JSONB;
ALTER TABLE events ADD COLUMN social_links_json JSONB;
ALTER TABLE events ADD COLUMN contact_recipient_email TEXT;

UPDATE events
SET event_details_json = '{
  "scheduleSummary": "Run event date, flag-off times, registration close, and pickup details are configurable for each year.",
  "routeNotes": "The Terry Fox Run Singapore is a non-competitive fun run with 5K and 10K categories.",
  "tshirtTitle": "2025 Terry Fox Run T-Shirt",
  "tshirtDescription": "This year''s limited-edition 45th anniversary collection features the Finish It logo, symbolizing our shared commitment to help finish Terry''s marathon against cancer. On the back of the shirt, Terry runs ahead seen from behind, leading millions across Canada and around the world to carry forward his fight against cancer.",
  "tshirtFrontImageUrl": "/paynow-placeholder.svg",
  "tshirtBackImageUrl": "/paynow-placeholder.svg",
  "kidsSizeChartImageUrl": "/paynow-placeholder.svg",
  "adultSizeChartImageUrl": "/paynow-placeholder.svg",
  "pickupDisclaimer": "We appreciate your help to pick up your t-shirt(s) during pickup at the configured pickup location as we are unable to arrange t-shirt pickup outside of these dates. Uncollected t-shirt(s) will be deemed a donation and resold on Run day. Thank you very much for your understanding.",
  "donationNote": "Your donation and support helps fund bold, innovative cancer research projects in Singapore in pursuit of Terry Fox''s dream of a world without cancer."
}',
faqs_json = '[
  {"question":"Will there be race packs and bib numbers issued for the Run?","answer":"This is a non-competitive fun run, so there are no race packs or bib numbers issued to participants.","displayOrder":1,"active":true},
  {"question":"Are there prizes for the top placing runners?","answer":"This is a non-competitive fun run with no placement, medals, or prizes for participants.","displayOrder":2,"active":true},
  {"question":"Can I exchange my T-shirt if I ordered the wrong size?","answer":"To minimize wastage, T-shirt quantities are prepared according to registrations received. We regret that size exchanges cannot be arranged, so please check the size chart carefully before purchasing.","displayOrder":3,"active":true},
  {"question":"Can someone else pick up my T-shirt for me?","answer":"Yes. Your designate should bring a copy of your Terry Fox Run confirmation slip with the QR code.","displayOrder":4,"active":true},
  {"question":"Will I receive a tax exemption for cash donations?","answer":"For donors who elect tax exemption, donation information will be submitted electronically to IRAS through the Singapore Cancer Society. Please ensure registration details are correct. Processing may take several weeks.","displayOrder":5,"active":true},
  {"question":"What happens to the funds raised?","answer":"Net proceeds support cancer research through Singapore Cancer Society and Terry Fox research initiatives.","displayOrder":6,"active":true}
]',
social_links_json = '{
  "instagramUrl": "https://instagram.com/terryfoxrunsingapore/",
  "instagramLogoUrl": "/ig_logo.jpg",
  "facebookUrl": "https://www.facebook.com/Terry-Fox-Run-Singapore-509827395766103/",
  "facebookLogoUrl": "/fb_logo.jpg"
}',
contact_recipient_email = 'corporate@terryfoxrun.global';

CREATE TABLE contact_submissions (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    message TEXT,
    recipient_email TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
