# Terry Fox Run Singapore Website Proposal

Prepared for: Terry Fox Run Singapore Executive Committee  
Purpose: Initial approval of website direction, feature scope, and implementation priorities

## Executive Summary

We recommend continuing with the product direction developed so far: a Terry Fox Run Singapore website that brings event registration, optional T-shirt purchase, donations, corporate shirt orders, participant confirmations, pickup QR codes, announcements, and admin operations under our own control.

The current codebase should be treated as an early technical scaffold rather than a finished product. It contains useful backend thinking around events, registrations, inventory, pickup, payments, corporate orders, announcements, and exports, but the approval stage should focus on the proposed participant experience and operating model.

The proposed website should be polished, mobile-friendly, and reusable across years. The visual direction is red, white, black, and dark blue, with warm event photography and clear calls to action.

## Goals and Success Criteria

The website should help the committee achieve four goals:

1. Keep more fundraising value by reducing reliance on a third-party registration platform.
2. Make it easy for participants to register, buy shirts, donate, and retrieve pickup information.
3. Make event operations easier for volunteers and admins through inventory, pickup, announcements, and exports.
4. Make future yearly runs easier to launch through reusable event configuration.

Success means:

- Participants can complete registration on mobile without confusion.
- One payer can register multiple participants in a single checkout.
- Shirt purchases and donations are clearly separated from run participation.
- T-shirt pickup can be handled by QR code or manual code.
- Admins can configure each event without changing code.
- The site can be reused for future years by cloning or updating event settings.

## Proposed Page Map

### Public Pages

- **Home:** Event overview, mission, Register CTA, Donate CTA, T-shirt preview, route highlights, sponsors, FAQ entry point.
- **Event Details:** 5K and 10K information, schedule, venue, registration close date, pickup dates, FAQ.
- **Register:** Individual registration with support for adding multiple participants.
- **Corporate Orders:** Company shirt-order form for bulk shirt quantities, with offline payment follow-up.
- **Confirmation:** Registration summary, payment status, receipt information, pickup QR/code, next steps.
- **Past Runs:** Archive of previous runs, highlights, photos, and links.

### Participant Area

- **Dashboard:** My registrations, QR/pickup code, T-shirt order details, donation details, receipts, announcements.

### Admin Area

- **Overview:** Registration counts, donation totals, shirts sold, inventory remaining.
- **Event Setup:** Current event selection, event dates, registration dates, pickup dates, locations, copy.
- **Categories:** Enable or disable 5K and 10K, and optionally add more categories later.
- **Field Configuration:** Required, optional, or hidden registration fields per event.
- **Inventory:** Adult and kids shirt sizes, quantities, and adjustments.
- **Registrations:** Search, filter, view details, and export CSV.
- **Corporate Orders:** View orders, update status, export CSV.
- **Announcements:** Publish updates to dashboard and optionally email participants.
- **Pickup Tool:** Volunteer QR scan and manual code entry.

## Registration Model

The individual registration flow should support one payer registering multiple participants.

Per participant, the configurable fields can include:

- Name
- Email
- Phone
- Emergency contact name
- Emergency contact phone
- Date of birth
- Gender
- Address
- Residency or identity information, including NRIC/passport/FIN style field or last four digits
- Medical notes, optional
- Category: 5K or 10K

The admin should be able to set each field as required, optional, or hidden per event. This keeps the site reusable across years and gives the committee flexibility if requirements change.

Run participation itself should not require a T-shirt purchase. A participant can register without a shirt, buy one shirt, or purchase additional shirts where allowed.

For v1 payments, individual registrations should support PayNow and bank transfer. Both methods are manually verified by admins before the registration is fully confirmed.

## T-Shirt Purchase and Pickup Model

T-shirt purchase should be optional. The default T-shirt price is SGD 35 per shirt, regardless of adult or kids size.

Default shirt sizes:

- Adult: XS, S, M, L, XL, XXL, XXXL
- Kids: XS, S, M, L

Admins should be able to configure which sizes are available for each event and set inventory quantities. Inventory should be enforced so that unavailable sizes cannot continue selling indefinitely.

Pickup model:

- After successful payment, each participant or order receives a unique QR code and short pickup code.
- The QR/code appears in the confirmation email and participant dashboard.
- Volunteers can scan the QR code or enter the code manually.
- The system marks the shirt as collected and prevents duplicate collection.
- T-shirt size changes are not allowed after purchase.
- A designated collector can use the participant's QR confirmation slip to collect on their behalf.

This model matches the existing operational expectation that there are no race packs, bibs, timing chips, winners, or prizes.

## Donation Model

Donation should be encouraged but optional.

Suggested donation presets:

- SGD 20
- SGD 50
- SGD 100

Participants should also be able to enter a custom donation amount. If a participant does not buy a T-shirt, the default donation amount can remain SGD 0, but the UI should make donation easy and visible.

## Corporate Order Model

Corporate orders should be shirt-only for v1. They should not require individual runner details.

The corporate form should collect:

- Company name
- Company address
- UEN
- Contact name
- Contact email
- Contact phone
- Shirt sizes and quantities

Corporate orders should skip online payment. The organizing team will follow up separately with invoice or bank transfer instructions.

Admin capabilities for corporate orders:

- View all corporate orders
- View shirt size breakdown
- Update order status
- Export corporate order CSV

## Admin Capabilities

The admin area is essential because it makes the site reusable and reduces dependency on technical edits each year.

Required admin roles:

- **Admin:** Full access to event setup, registrations, inventory, announcements, corporate orders, exports, and reports.
- **Volunteer:** Limited access to pickup scanning and manual code entry.
- **Participant:** Access to their own dashboard and registrations.

Important admin functions:

- Create or update event details.
- Manually select the current event shown on the homepage.
- Configure registration open and close dates.
- Configure pickup dates and locations.
- Enable or disable 5K and 10K categories.
- Configure registration fields as required, optional, or hidden.
- Configure T-shirt sizes and inventory.
- View registration counts, donation totals, shirts sold, and shirts remaining.
- Send announcements to dashboard and email.
- Export registration, corporate order, and finance CSVs.

## Yearly Reuse Model

The website should be designed around an event configuration model rather than one-off hardcoded pages.

Each yearly event can have:

- Name and year
- Current event flag
- Registration dates
- Event date and time
- Pickup dates
- Event location
- Pickup location
- Categories
- Registration field rules
- Donation presets
- Shirt price
- Shirt sizes and inventory
- Homepage copy and visual assets

The organizing team should be able to clone the previous year's event, update dates and details, upload new assets, set inventory, and open registration.

Past events should remain available on a Past Runs page, while the homepage highlights the manually selected current event.

## Reference Facts From Existing Public Material

Useful public reference points for the proposal:

- The 2025 Singapore listing describes the run as taking place on 30 Nov 2025 at Angsana Green ECP at 7am, with 5km and 10km options and no entry fee.
- The 2025 listing states that shirt and donation registration closes before event day, and pickup is on a separate weekend.
- The existing FAQ states that there are no race packs, bibs, timing chips, winners, or prizes.
- The existing FAQ states that no T-shirt size exchanges are allowed.
- The existing FAQ says a designated person can use the QR confirmation slip to collect a shirt.
- The existing registration reference collects fields such as residency, NRIC/passport/FIN, date of birth, and gender.

Sources:

- JustRunLah 2025 listing: https://www.justrunlah.com/race/terry-fox-run-2025/
- Terry Fox Run Singapore FAQ: https://www.terryfoxrun.sg/faq2024
- Existing registration reference: https://reg5.events-sign-up.com/cgi-bin/registration/tfr2025/prereg.cgi

## Decisions Requested From the Committee

Please review and comment on the following:

1. Do we approve the overall visual direction: red, white, black, dark blue, warm, modern, and event-focused?
2. Do we approve the MVP feature scope: public site, registration, optional shirts, optional donations, corporate shirt orders, participant dashboard, admin portal, pickup, announcements, and exports?
3. Do we approve PayNow and bank transfer as the v1 payment methods, with manual admin verification?
4. Do we approve corporate orders as shirt-only with offline payment follow-up?
5. Do we approve the pickup model: QR code plus manual code, no size exchanges, designated collector allowed?
6. Do we agree that sponsor-a-participant, lucky draw, Stripe or other automated payment integration, SMS, and advanced offline pickup sync are later enhancements rather than v1 requirements?

## Open Questions and Comment Areas

### Event Details

- What is the confirmed 2026 event date?
- What is the confirmed event venue?
- What is the confirmed start time?
- What is the confirmed pickup venue?
- What are the confirmed pickup dates and times?

### Content and Branding

- Do we have approved Terry Fox Run Singapore logo files?
- Do we have approved event photography?
- Which sponsor logos should appear at launch?
- Who should approve final homepage and FAQ copy?

### Operations

- Who should have admin access?
- Who should have volunteer pickup access?
- Which email address or domain should send participant emails?
- Who will monitor corporate order follow-up?

### Policy

- Do we need waiver language in v1?
- Do we need PDPA consent language in v1?
- What refund or cancellation wording should appear?
- Should the participant identity field collect full NRIC/passport/FIN, partial value, or another format?

## Recommended Implementation Phases

### Phase 1: Approval and Cleanup

- Approve design direction and MVP scope.
- Finalize event facts, copy, assets, and required fields.
- Clean frontend dependency setup.
- Fix backend compile and configuration issues.
- Confirm technical stack and hosting choices from `technical-stack-and-design-plan.md`.

### Phase 2: Public Site and Registration

- Build homepage, event page, registration flow, corporate order flow, and confirmation pages.
- Build PayNow/bank-transfer checkout instructions and payment proof submission.
- Add pending payment email, confirmed payment email, and dashboard basics.

### Phase 3: Admin and Pickup

- Build event setup, inventory, registrations, announcements, pickup, corporate orders, and exports.
- Add role-based admin and volunteer access.
- Test event-day pickup flow.

### Later Enhancements

- Sponsor-a-participant.
- Lucky draw.
- Stripe or other automated payment integration.
- Fundraising pages and leaderboards.
- SMS notifications.
- Advanced offline pickup sync.
- More detailed analytics.

## Technical Stack Summary

The recommended technical stack is documented in `technical-stack-and-design-plan.md`.

Initial technical direction:

- Frontend: Next.js App Router, TypeScript, Material UI, React Hook Form, Zod, TanStack Query, Recharts, QR display/scanning libraries.
- Backend: Java 21, Spring Boot 3.x, REST APIs, Spring Security with Auth0 JWT validation, Spring Data JPA, PostgreSQL, Flyway, Actuator.
- Authentication: Auth0 Universal Login with participant, admin, and volunteer roles.
- Payments: manual PayNow and bank-transfer verification for launch.
- Storage: managed object storage for payment proof uploads, slideshow images, indemnity files, and exports.
- Hosting: managed-simple posture with Vercel frontend, Fly.io Singapore backend, and Supabase Singapore database/storage.
- Email: Postmark or SendGrid with SPF, DKIM, and DMARC configured before launch.



## Notes 10 May 2026

Main payment methods: PayNow, Paylah
Backup payment method: Bank Transfer, Stripe

Li Sun to follow up on Stripe

Corporate orders:
- Admins to set up different packages
- Corporate to select a package and then select sizes based on allocation
- Corporate payment flow to be part of website

Participant orders:
- Multiple participants
    - Details optional
    - Main person has to provide their details

Make sure email doesn't get marked as spam?!

Do we own this domain? https://www.terryfoxrun.sg/

Feature requests:
- sponsor a participant (add on feature)
- home screen has tracker that shows how much has been raised
- lucky draw

PDPDA compliance
- Ensure PDPA compliance by whichever host we choose to use
