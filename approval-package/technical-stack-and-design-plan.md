# Terry Fox Run Singapore Technical Stack and Design Plan

## Summary

The initial website should use a managed, conservative stack that fits the existing project direction: Next.js + Material UI for the frontend, Spring Boot Java for the backend, PostgreSQL for persistence, Auth0 for account login, manual PayNow and bank-transfer reconciliation, admin-managed media, and hosted email.

The architecture should prioritize:

- Mobile-first participant experience
- Yearly reuse
- Auditability for payments, orders, email, and inventory
- Low operational burden for a volunteer-run committee
- Singapore-region hosting where practical

## Recommended Tech Stack

### Frontend

- **Framework:** Next.js App Router with TypeScript.
- **UI framework:** Material UI (MUI) with Emotion styling.
- **Forms:** React Hook Form + Zod.
- **Data fetching:** TanStack Query calling backend REST APIs.
- **Charts:** Recharts for fundraising tracker and inventory trend charts.
- **QR display:** QR code React component for pickup codes.
- **QR scanning:** Browser camera QR scanner for volunteer/admin pickup.
- **Decision:** use MUI only; remove accidental Tailwind setup from the production frontend.

### Backend

- **Language:** Java 21.
- **Framework:** Spring Boot 3.x.
- **API style:** REST JSON APIs.
- **Security:** Spring Security OAuth2 Resource Server validating Auth0 JWTs.
- **Persistence:** Spring Data JPA / Hibernate.
- **Database migrations:** Flyway.
- **Validation:** Jakarta Bean Validation plus service-level business validation.
- **Background jobs:** Spring scheduled jobs for payment reminders, email retries, and admin summaries.
- **Observability:** Spring Actuator health endpoints and structured application logs.

### Database and Storage

- **Database:** PostgreSQL.
- **Recommended managed DB:** Supabase Postgres in Singapore region.
- **File/media storage:** Supabase Storage or equivalent object storage.
- **Storage use cases:** payment proof uploads, slideshow images, indemnity documents, exports, and admin-uploaded assets.
- **Schema style:** relational tables for core records; JSONB only for configurable event settings, display preferences, and page copy blocks.

### Authentication

- **Provider:** Auth0 Universal Login.
- **Account model:** full participant accounts.
- **Roles:** participant, admin, volunteer.
- **Frontend:** Auth0 Next.js SDK for login/session.
- **Backend:** Auth0 JWT validation and role checks in Spring Security.
- **Admin access:** role-gated pages and APIs.

### Hosting

- **Frontend:** Vercel, with Singapore region configured for server-side compute where used.
- **Backend:** Fly.io app deployed in Singapore region.
- **Database/storage:** Supabase Singapore region.
- **Deployment style:** backend Docker image; environment variables for secrets/provider credentials.
- **Reasoning:** managed services keep operations light while allowing Singapore-region backend/database placement.

### Email

- **Provider:** Postmark or SendGrid; recommended default is Postmark for deliverability.
- **Email types:** account emails, pending payment email, payment confirmed email, pickup reminders, event announcements, and admin mass email.
- **Spam prevention:** verified sender domain with SPF, DKIM, and DMARC before launch.
- **Auditability:** store outgoing email campaigns, recipients, and delivery state.

## Key Technical Design Decisions

### Payments

- No automated payment gateway for initial launch.
- Supported payment methods: PayNow and bank transfer.
- System generates a unique order/payment reference.
- User selects payment method, pays externally, enters transaction/payment ID, optionally uploads proof, and clicks "I've paid."
- Registration status becomes `Waiting for Payment Confirmation`.
- Admin verifies payment, records final transaction ID, and marks order paid.
- Fundraising tracker and pickup QR/manual code are based only on admin-confirmed payments.

### Configurable Events

- Admin can configure current event, event detail page, categories, form fields, indemnity text, T-shirt sizes, inventory, payment instructions, and homepage slideshow.
- Homepage shows current-event overview only.
- Clicking current event opens a dedicated event detail page.
- Event slideshow supports uploaded images plus blurbs/captions.
- Past event history and transaction history remain available across years.

### Registration Model

- Payer account is required.
- Payer fields include name, email, NRIC/passport number, Singapore address, and blood type.
- Payer fields are admin-configurable as required, optional, or hidden.
- Added participant detail fields are optional by default.
- Category is selected per participant and admin-configurable.
- Payer and added participants can each purchase 0, 1, or more shirts and add donations.
- Indemnity agreement is required before checkout.

### Corporate Orders

- Admin configures corporate packages.
- Corporate user selects package, allocates shirt sizes, chooses PayNow or bank transfer, submits proof/reference, and waits for admin confirmation.
- Corporate package, payment, allocation, and status history are stored and exportable.

### Inventory

- Inventory is tracked by event, shirt type, and size.
- Admin sees current stock as both a list and chart.
- Every stock change creates an inventory movement record, enabling daily trend charts.
- Confirmed individual and corporate payments reduce available inventory.
- Pickup collection status is separate from paid/sold inventory.

### Admin Portal

- Admin verifies payments, manages payment proof, records transaction IDs, and updates order states.
- Admin manages slideshow images/blurbs, form fields, categories, packages, inventory, pickup, exports, and mass email.
- Volunteer role is limited to pickup scanning/manual lookup.
- Admin dashboard includes fundraising totals, pending payment count, confirmed payment count, shirts sold, stock remaining, and daily stock trend.

## Important Data and Interface Additions

- `EventSlideshowImage`: image URL, blurb, display order, active flag.
- `EventFormFieldConfig`: field key, label, required/optional/hidden, applies to payer/participant/corporate.
- `Registration`: payer, event, status, payment status, total amount, generated payment reference.
- `Participant`: optional participant details, category, shirt orders, donation amount.
- `PaymentAttempt`: method, generated reference, user-entered transaction ID, proof file URL, admin verification status.
- `InventoryMovement`: event, size, type, quantity delta, reason, linked registration/order, timestamp.
- `CorporatePackage`: package name, price, shirt allocation rules.
- `EmailCampaign`: audience, subject, body, sent status, created by.

## Test Plan

- Unit tests for pricing, donation totals, shirt quantities, payment status transitions, and inventory movement creation.
- Integration tests with PostgreSQL/Testcontainers for registration, corporate order, manual payment verification, and pickup flows.
- End-to-end Playwright tests for mobile registration, payment proof submission, admin verification, My Events, pickup scan/manual code, and admin slideshow update.
- Email tests using provider sandbox/test mode.
- Security tests for participant/admin/volunteer route permissions.
- Accessibility checks for registration, checkout, and pickup screens.

## Implementation Notes

- Clean frontend dependencies before feature work: MUI should be installed and Tailwind removed.
- Remove Stripe from initial product scope unless the committee later confirms a viable charity/SCS setup.
- Keep backend payment records generic enough to support a future automated provider without redesigning registration.
- Keep uploads provider-agnostic through a storage service abstraction.
- Keep email provider-agnostic through an email service abstraction.

