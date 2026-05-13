# Terry Fox Run Singapore Website

Full-stack MVP workspace for the Terry Fox Run Singapore website.

## Structure

- `frontend/` - Next.js App Router frontend with Material UI.
- `backend/` - Spring Boot API with Flyway migrations.
- `approval-package/` - committee proposal, approval deck, and technical plan artifacts.
- `docs/` - engineering plans and launch-readiness notes.

## Local Backend

Use the H2-backed test profile for local MVP development when Postgres is not running:

```bash
cd backend
mvn spring-boot:test-run -Dspring-boot.run.profiles=test
```

The API runs at `http://127.0.0.1:8080`.

Run backend tests:

```bash
cd backend
mvn test
```

The default backend profile expects a local or managed PostgreSQL database:

```bash
cd backend
mvn spring-boot:run
```

Default profile values are read from environment variables such as `DATABASE_URL`,
`DATABASE_USERNAME`, `DATABASE_PASSWORD`, `AUTH0_ISSUER`, and `AUTH0_AUDIENCE`.

## Local Frontend

Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://127.0.0.1:3000` and calls the backend configured by
`NEXT_PUBLIC_API_BASE_URL`.

Build the frontend:

```bash
cd frontend
npm run build
```

Run the production build locally:

```bash
cd frontend
npm run start -- -H 127.0.0.1
```

## Local Profiles And Environments

- **H2/test profile:** fast local API and integration tests; no external services required.
- **Default/Postgres profile:** local or managed PostgreSQL; Flyway migrations run at startup.
- **Staging/production:** use managed PostgreSQL/storage/email/auth providers with real env vars.

Email and storage are currently provider-agnostic local abstractions. Real provider credentials
should not be committed.

## Verification

Before committing launch-prep changes:

```bash
cd backend && mvn test
cd ../frontend && npm run build
```

