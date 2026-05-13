# Launch Readiness Checklist

## Committee Decisions

- Confirm 2026 event date, start time, venue, pickup venue, pickup dates, and pickup times.
- Confirm required registration fields and whether identity collection uses full or partial identifiers.
- Approve indemnity, PDPA consent, refund, and cancellation wording.
- Approve homepage, event page, FAQ, payment, and pickup copy.

## Content And Assets

- Provide approved logo files.
- Provide Terry Fox and past-run slideshow images.
- Provide first slideshow blurbs.
- Provide sponsor logos for sponsor sections only.

## Accounts And Infrastructure

- Confirm ownership of `terryfoxrun.sg`.
- Create Auth0 tenant/app/API and define participant, admin, and volunteer roles.
- Create Supabase project for PostgreSQL and object storage.
- Create Postmark or SendGrid account.
- Configure SPF, DKIM, and DMARC for the sender domain.
- Create Vercel project for the frontend.
- Create Fly.io app for the backend in Singapore region.

## Payment Operations

- Confirm PayNow details.
- Confirm bank-transfer details.
- Confirm payment reference wording participants should enter.
- Assign payment verifiers and verification cadence.
- Rehearse confirm and reject flows in staging.

## Launch Rehearsal

- Create a staging event.
- Register one participant with donation only.
- Register one participant with shirt purchase.
- Register one payer with multiple participants.
- Submit PayNow proof and confirm payment.
- Submit bank-transfer proof and reject payment.
- Verify dashboard status and pickup code behavior.
- Export registrations, finance, corporate orders, and inventory CSVs.
- Test pickup scan/manual-code flow.
