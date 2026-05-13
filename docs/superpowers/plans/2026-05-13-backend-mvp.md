# Backend MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Spring Boot backend slice for event configuration, registration, manual PayNow/bank-transfer payment tracking, and inventory movement.

**Architecture:** Use Spring Boot REST controllers over JPA entities with Flyway-managed relational tables. Keep the first implementation intentionally narrow: public event APIs, registration creation, payment attempt submission, admin verification, slideshow configuration records, form field configuration records, and inventory movement records.

**Tech Stack:** Java 21, Spring Boot 3.x, Spring Data JPA, Spring Security OAuth2 Resource Server, Flyway, PostgreSQL production dialect, H2 for local tests.

---

### Task 1: Frontend Smoke Test Stability

**Files:**
- Modify: `frontend/package.json`

- [x] **Step 1: Reproduce frontend production build**

Run: `npm run build` from `frontend`.
Expected: production build succeeds.

- [x] **Step 2: Reproduce dev route issue**

Run: `npm run dev` and fetch `/`.
Expected before fix: `localStorage.getItem is not a function` with Node 25 experimental Web Storage.

- [x] **Step 3: Stabilize scripts**

Set `NODE_OPTIONS=--no-experimental-webstorage` for `dev`, `build`, and `start`.

- [x] **Step 4: Verify local route**

Run `npm run dev`, then `curl -I http://localhost:<port>`.
Expected: `HTTP/1.1 200 OK`.

### Task 2: Backend Domain and Payment Flow

**Files:**
- Modify: `backend/pom.xml`
- Modify: `backend/src/main/resources/application.yml`
- Create: `backend/src/main/java/com/terryfoxrun/backend/TerryFoxRunBackendApplication.java`
- Create: `backend/src/main/java/com/terryfoxrun/backend/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/terryfoxrun/backend/domain/*.java`
- Create: `backend/src/main/java/com/terryfoxrun/backend/repository/*.java`
- Create: `backend/src/main/java/com/terryfoxrun/backend/service/*.java`
- Create: `backend/src/main/java/com/terryfoxrun/backend/web/*.java`
- Create: `backend/src/main/resources/db/migration/V1__initial_schema.sql`
- Create: `backend/src/test/java/com/terryfoxrun/backend/service/RegistrationPaymentFlowTest.java`

- [x] **Step 1: Write failing service tests**

Create tests that assert registration creation generates a payment reference, totals donation plus shirts, stores payer/participant details, and admin payment confirmation creates inventory movements.

- [x] **Step 2: Run tests and verify red**

Run: `mvn test`.
Expected: compile/test failure because backend classes do not exist yet.

- [x] **Step 3: Implement minimal domain/services/controllers**

Add entities, repositories, DTOs, services, REST controllers, security config, and migration needed by the tests.

- [x] **Step 4: Run backend verification**

Run: `mvn test`.
Expected: tests pass.

### Task 3: Final Verification

**Files:**
- Existing frontend and backend files.

- [x] **Step 1: Run frontend build**

Run: `npm run build` from `frontend`.
Expected: build succeeds.

- [x] **Step 2: Run backend tests**

Run: `mvn test` from `backend`.
Expected: tests pass.

- [x] **Step 3: Report verified scope and known gaps**

Summarize implemented endpoints and note that Auth0 configuration, email provider integration, file storage, and complete admin UI are still future slices.
