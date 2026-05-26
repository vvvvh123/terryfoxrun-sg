import { expect, test, type Page } from "@playwright/test";

const event = {
  id: 1,
  name: "Terry Fox Run Singapore",
  year: 2026,
  isCurrent: true,
  status: "PUBLISHED",
  eventStart: "2026-11-29T07:00:00",
  registrationClose: "2026-11-20T23:59:00",
  pickupStart: "2026-11-21T10:00:00",
  locationEvent: "Angsana Green, East Coast Park",
  locationPickup: "Canadian International School",
  donationPresets: [25, 50, 100],
  shirtPrice: 3500,
  shirtSizes: [{ type: "adult", size: "M", quantityAvailable: 100 }],
  paymentInstructions: {
    payNowQrImageUrl: "/paynow-placeholder.svg",
    payNowInstruction: "Scan the PayNow QR code and enter your Terry Fox Run reference in the payment comments.",
    bankName: "DBS Bank Pte Ltd",
    bankAccountNumber: "123-456-7890",
    bankAccountName: "Terry Fox Run Singapore",
    bankInstruction: "Transfer the exact amount and enter your Terry Fox Run reference in the transfer comments.",
    proofBucket: "payment-proofs",
  },
  eventDetails: {
    scheduleSummary: "Flag-off at 7am with 5K and 10K options.",
    routeNotes: "Walk, jog, or run along East Coast Park.",
    tshirtTitle: "2026 Terry Fox Run T-Shirt",
    tshirtDescription: "Limited-edition event T-shirt for supporters.",
    tshirtFrontImageUrl: "/paynow-placeholder.svg",
    tshirtBackImageUrl: "/paynow-placeholder.svg",
    kidsSizeChartImageUrl: "/paynow-placeholder.svg",
    adultSizeChartImageUrl: "/paynow-placeholder.svg",
    pickupDisclaimer: "Please collect your T-shirt during the published pickup window.",
    donationNote: "All net proceeds support cancer research in Singapore.",
    indemnityText: "I understand the risks of participating in the Terry Fox Run.",
    pdpaConsentText: "I consent to Terry Fox Run Singapore collecting my registration details for event operations.",
    refundCancellationText: "T-shirt purchases and donations are non-refundable once confirmed.",
  },
  faqs: [{ question: "Are there race bibs?", answer: "No race bibs are issued for this community run.", displayOrder: 1, active: true }],
  contactRecipientEmail: "committee@example.com",
  socialLinks: {
    instagramUrl: "https://instagram.com/terryfoxrunsingapore/",
    instagramLogoUrl: "/ig_logo.jpg",
    facebookUrl: "https://www.facebook.com/Terry-Fox-Run-Singapore-509827395766103/",
    facebookLogoUrl: "/fb_logo.jpg",
  },
};

const categories = [
  { id: 11, eventId: 1, name: "5K Fun Run", description: "Walk, jog, or run.", basePrice: 0, isActive: true },
  { id: 12, eventId: 1, name: "10K Fun Run", description: "Longer route.", basePrice: 0, isActive: true },
];

const paymentAttempt = {
  id: 20,
  registrationId: 123,
  method: "PAYNOW",
  generatedReference: "TFR2026-12345",
  userTransactionId: "TFR2026-12345",
  proofFileUrl: "https://example.com/payment-proof.png",
  verificationStatus: "PENDING_ADMIN_VERIFICATION",
  eventId: 1,
  payerName: "Alex Tan",
  payerEmail: "alex@example.com",
  totalAmount: 8500,
};

const registration = {
  id: 123,
  eventId: 1,
  eventName: event.name,
  eventYear: event.year,
  payerName: "Alex Tan",
  payerEmail: "alex@example.com",
  status: "WAITING_FOR_PAYMENT_CONFIRMATION",
  paymentStatus: "WAITING_FOR_PAYMENT_CONFIRMATION",
  totalAmount: 8500,
  generatedPaymentReference: "TFR2026-12345",
  participants: [
    {
      id: 501,
      categoryId: 11,
      categoryName: "5K Fun Run",
      name: "Alex Tan",
      email: "alex@example.com",
      tshirtSize: "M",
      tshirtType: "adult",
      tshirtQty: 1,
      shirtOrders: [{ size: "M", type: "adult", quantity: 1 }],
      pickupCode: "PU-501",
      pickupStatus: "NOT_COLLECTED",
    },
  ],
  paymentAttempts: [paymentAttempt],
};

const confirmedRegistration = {
  ...registration,
  id: 456,
  status: "CONFIRMED",
  paymentStatus: "CONFIRMED",
  participants: [{ ...registration.participants[0], id: 601, pickupCode: "READY456", pickupStatus: "PENDING" }],
  paymentAttempts: [{ ...paymentAttempt, id: 21, registrationId: 456, verificationStatus: "CONFIRMED" }],
};

const announcement = {
  id: 30,
  eventId: 1,
  title: "Pickup reminder",
  body: "Bring your QR code or manual pickup code.",
  channelEmail: false,
  channelDashboard: true,
  createdBy: "admin",
};

const corporatePackage = {
  id: 40,
  eventId: 1,
  packageName: "Bronze",
  price: 50000,
  shirtAllocationRulesJson: "{\"adult\":{\"M\":10,\"L\":10}}",
  active: true,
};

const corporateOrder = {
  id: 50,
  eventId: 1,
  companyName: "Acme Pte Ltd",
  companyAddress: "1 Corporate Way",
  uen: "202600001Z",
  contactName: "Corporate Lead",
  contactEmail: "lead@example.com",
  contactPhone: "89990000",
  corporatePackageId: 40,
  corporatePackageName: "Bronze",
  status: "pending",
  items: [{ id: 51, size: "M", type: "adult", quantity: 5 }],
};

async function mockBackend(page: Page) {
  await page.route("http://127.0.0.1:8080/api/events", (route) => route.fulfill({ json: [event] }));
  await page.route("http://127.0.0.1:8080/api/events/current", (route) => route.fulfill({ json: event }));
  await page.route("http://127.0.0.1:8080/api/events/1", (route) => route.fulfill({ json: event }));
  await page.route("http://127.0.0.1:8080/api/events/1/categories", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({ json: { id: 13, eventId: 1, name: "Accessible 5K", description: "Accessible route", basePrice: 0, isActive: true } });
    }
    return route.fulfill({ json: categories });
  });
  await page.route("http://127.0.0.1:8080/api/events/1/categories/11", (route) => route.fulfill({ json: { ...categories[0], name: "5K Updated" } }));
  await page.route("http://127.0.0.1:8080/api/events/1/categories/12", (route) => route.fulfill({ json: categories[1] }));
  await page.route("http://127.0.0.1:8080/api/events/1/slideshow", (route) =>
    route.fulfill({
      json: [
        {
          id: 1,
          imageUrl: "https://example.com/terry-fox.jpg",
          blurb: "Terry Fox's legacy leads the Singapore run.",
          displayOrder: 1,
          active: true,
        },
      ],
    }),
  );
  await page.route("http://127.0.0.1:8080/api/events/1/inventory", (route) =>
    route.fulfill({ json: [{ type: "adult", size: "M", quantityAvailable: 100 }] }),
  );
  await page.route("http://127.0.0.1:8080/api/events/1/inventory/sold-daily**", (route) =>
    route.fulfill({ json: [{ date: "2026-05-17", size: "M", quantitySold: 3 }] }),
  );
  await page.route("http://127.0.0.1:8080/api/events/1/stats", (route) =>
    route.fulfill({
      json: {
        confirmedAmount: 8500,
        pendingAmount: 8500,
        confirmedPaymentCount: 1,
        pendingPaymentCount: 1,
        dailyAmounts: [
          {
            date: "2026-05-17",
            confirmedAmount: 8500,
            pendingAmount: 8500,
            cumulativeConfirmedAmount: 8500,
            cumulativePendingAmount: 8500,
          },
        ],
      },
    }),
  );
  await page.route("http://127.0.0.1:8080/api/events/1/registrations**", (route) =>
    route.fulfill({
      json: {
        counts: { total: 2, confirmed: 1, pendingPayment: 1, rejected: 0 },
        dailyRegistrations: [{ date: "2026-05-17", count: 2 }],
        registrations: [
          {
            id: 456,
            payerName: "Alex Tan",
            payerEmail: "alex@example.com",
            generatedPaymentReference: "TFR2026-12345",
            status: "CONFIRMED",
            paymentStatus: "CONFIRMED",
            totalAmount: 8500,
            createdAt: "2026-05-17T10:00:00Z",
            participantCount: 1,
            shirtSummary: "1 x adult M",
          },
        ],
      },
    }),
  );
  await page.route("http://127.0.0.1:8080/api/events/1/form-fields", (route) => route.fulfill({ json: [] }));
  await page.route("http://127.0.0.1:8080/api/events/1/announcements**", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({ json: announcement });
    }
    return route.fulfill({ json: [announcement] });
  });
  await page.route("http://127.0.0.1:8080/api/events/1/email-campaigns**", (route) => {
    if (route.request().url().endsWith("/audiences")) {
      return route.fulfill({
        json: [
          { key: "all-participants", label: "All registered participants", description: "Every individual registration for this event.", count: 2 },
          { key: "confirmed-participants", label: "Confirmed participants", description: "Registrations with confirmed payment.", count: 1 },
          { key: "pending-payment", label: "Waiting for payment confirmation", description: "Participants waiting for admin verification.", count: 1 },
          { key: "payment-rejected", label: "Payment rejected / needs attention", description: "Participants who need follow-up.", count: 0 },
          { key: "corporate-contacts", label: "Corporate contacts", description: "Submitted corporate order contacts.", count: 1 },
          { key: "test-preview", label: "Test preview only", description: "Creates a local preview.", count: 1 },
        ],
      });
    }
    if (route.request().method() === "POST") {
      return route.fulfill({ json: { id: 31, eventId: 1, audience: "confirmed-participants", subject: "Run update", body: "See you there.", sentStatus: "PREVIEW_CREATED" } });
    }
    return route.fulfill({ json: [] });
  });
  await page.route("http://127.0.0.1:8080/api/events/1/corporate-packages**", (route) => {
    if (route.request().method() === "POST" || route.request().method() === "PATCH") {
      return route.fulfill({ json: corporatePackage });
    }
    return route.fulfill({ json: [corporatePackage] });
  });
  await page.route("http://127.0.0.1:8080/api/corporate-orders**", (route) => {
    if (route.request().method() === "POST") return route.fulfill({ json: 50 });
    if (route.request().method() === "PATCH") return route.fulfill({ json: { ...corporateOrder, status: "fulfilled" } });
    return route.fulfill({ json: [corporateOrder] });
  });
  await page.route("http://127.0.0.1:8080/api/admin/payment-attempts**", (route) => route.fulfill({ json: [paymentAttempt] }));
  await page.route("http://127.0.0.1:8080/api/admin/roles/users", (route) =>
    route.fulfill({
      json: {
        configured: true,
        message: "Supabase roles loaded.",
        counts: { admin: 1, volunteer: 1, participant: 2 },
        users: [
          {
            id: "c56d2ed5-8a58-4e49-a425-4df634188e5c",
            email: "harlanivikas@gmail.com",
            appRole: "admin",
            createdAt: "2026-05-10T10:00:00Z",
            lastSignInAt: "2026-05-24T10:00:00Z",
          },
        ],
      },
    }),
  );
  await page.route("http://127.0.0.1:8080/api/registrations", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        json: {
          registrationId: 123,
          generatedPaymentReference: "TFR2026-12345",
          totalAmount: 8500,
          status: "DRAFT",
          paymentStatus: "PENDING_PAYMENT",
        },
      });
      return;
    }
    await route.fulfill({ json: [registration] });
  });
  await page.route("http://127.0.0.1:8080/api/registrations/123", (route) => route.fulfill({ json: registration }));
  await page.route("http://127.0.0.1:8080/api/registrations/456", (route) => route.fulfill({ json: confirmedRegistration }));
  await page.route("http://127.0.0.1:8080/api/registrations/123/payment-attempts", (route) => route.fulfill({ json: paymentAttempt }));
  await page.route("http://127.0.0.1:8080/api/admin/payment-attempts/20/confirm", (route) =>
    route.fulfill({ json: { ...paymentAttempt, verificationStatus: "CONFIRMED", adminTransactionId: "BANK-999" } }),
  );
  await page.route("http://127.0.0.1:8080/api/admin/payment-attempts/20/reject", (route) =>
    route.fulfill({ json: { ...paymentAttempt, verificationStatus: "PAYMENT_REJECTED", rejectionReason: "Reference mismatch" } }),
  );
  await page.route("http://127.0.0.1:8080/api/events/1/contact-submissions", (route) => route.fulfill({ json: { id: 1, status: "EMAIL_PREVIEW_CREATED" } }));
  const pickupResult = {
    result: "READY_FOR_PICKUP",
    message: "Payment confirmed. Confirm collection when the shirts are handed over.",
    registrationId: 456,
    payerName: "Alex Tan",
    payerEmail: "alex@example.com",
    paymentStatus: "CONFIRMED",
    totalAmount: 8500,
    participantId: 601,
    participantName: "Alex Tan",
    categoryName: "5K Fun Run",
    tshirtSize: "M",
    tshirtType: "adult",
    tshirtQty: 1,
    shirtOrders: [{ size: "M", type: "adult", quantity: 1 }],
    pickupCode: "READY456",
    pickupStatus: "PENDING",
  };
  await page.route("http://127.0.0.1:8080/api/pickup/lookup", (route) => route.fulfill({ json: pickupResult }));
  await page.route("http://127.0.0.1:8080/api/pickup/collect", (route) => route.fulfill({
    json: {
      ...pickupResult,
      result: "COLLECTED",
      message: "Pickup marked as collected.",
      pickupStatus: "COLLECTED",
      pickupTimestamp: "2026-11-21T10:00:00Z",
    },
  }));
  await page.route("http://127.0.0.1:8080/api/pickup/history**", (route) => route.fulfill({ json: [{ ...pickupResult, result: "ALREADY_COLLECTED", pickupStatus: "COLLECTED", pickupTimestamp: "2026-11-21T10:00:00Z" }] }));
  await page.route("http://127.0.0.1:8080/api/pickup/events/1/summary", (route) => route.fulfill({
    json: {
      collectedCount: 1,
      pendingCount: 4,
      collected: [{
        participantId: 601,
        registrationId: 456,
        participantName: "Alex Tan",
        pickupCode: "READY456",
        tshirtSize: "M",
        tshirtType: "adult",
        tshirtQty: 1,
        pickupTimestamp: "2026-11-21T10:00:00Z",
      }],
    },
  }));
}

async function mockSignedInAdmin(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "sb-lhpondhrhnjnimvyozdc-auth-token",
      JSON.stringify({
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: {
          id: "c56d2ed5-8a58-4e49-a425-4df634188e5c",
          aud: "authenticated",
          role: "authenticated",
          email: "harlanivikas@gmail.com",
          app_metadata: {
            provider: "email",
            app_role: "admin",
          },
          user_metadata: {},
        },
      }),
    );
  });
}

test.beforeEach(async ({ page }) => {
  await mockSignedInAdmin(page);
  await mockBackend(page);
});

test("email login page signs in with password", async ({ page }) => {
  await page.route("https://lhpondhrhnjnimvyozdc.supabase.co/auth/v1/token**", (route) =>
    route.fulfill({
      json: {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        token_type: "bearer",
        expires_in: 3600,
        user: {
          id: "c56d2ed5-8a58-4e49-a425-4df634188e5c",
          aud: "authenticated",
          role: "authenticated",
          email: "harlanivikas@gmail.com",
          app_metadata: { app_role: "admin" },
          user_metadata: {},
        },
      },
    }),
  );

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await page.getByLabel("Email address").fill("harlanivikas@gmail.com");
  await page.getByLabel("Password").fill("test-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText("Successfully signed in.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Terry Fox Run Singapore, 2026" })).toBeVisible();
});

test("email login page supports account confirmation and reset resend flows", async ({ page }) => {
  await page.route("https://lhpondhrhnjnimvyozdc.supabase.co/auth/v1/signup**", (route) =>
    route.fulfill({
      json: {
        user: {
          id: "new-user",
          aud: "authenticated",
          role: "authenticated",
          email: "new@example.com",
          app_metadata: {},
          user_metadata: {},
        },
        session: null,
      },
    }),
  );
  await page.route("https://lhpondhrhnjnimvyozdc.supabase.co/auth/v1/resend**", (route) => route.fulfill({ json: {} }));
  await page.route("https://lhpondhrhnjnimvyozdc.supabase.co/auth/v1/recover**", (route) => route.fulfill({ json: {} }));

  await page.goto("/login");
  await page.getByRole("tab", { name: "Create account" }).click();
  await page.getByLabel("Email address").fill("new@example.com");
  await page.getByLabel("Password").fill("test-password-123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByText("Account created. Please check your email to confirm the account before signing in.")).toBeVisible();
  await page.getByRole("button", { name: "Send again" }).click();
  await expect(page.getByText("Confirmation email resent. Please check your inbox.")).toBeVisible();

  await page.getByRole("tab", { name: "Forgot password" }).click();
  await page.getByLabel("Email address").fill("new@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();

  await expect(page.getByText("Password reset email sent. Please check your inbox.")).toBeVisible();
  await page.getByRole("button", { name: "Send again" }).click();
  await expect(page.getByText("Password reset email resent. Please check your inbox.")).toBeVisible();
});

test("public pages and mobile-first registration checkout flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Terry Fox Run Singapore, 2026" })).toBeVisible();
  await expect(page.getByAltText("Terry Fox Run Singapore logo")).toBeVisible();
  await expect(page.getByText("Mobile-first registration")).toBeVisible();
  await page.goto("/terrys-story");
  await expect(page.getByRole("heading", { name: "One run inspired a movement." })).toBeVisible();

  await page.goto("/event");
  await expect(page.getByRole("heading", { name: "Terry Fox Run Singapore, 2026" })).toBeVisible();
  if ((page.viewportSize()?.width ?? 0) >= 900) {
    const eventNav = page.getByRole("link", { name: "Event", exact: true });
    await expect(eventNav).toHaveAttribute("aria-current", "page");
    await expect(eventNav).toHaveCSS("color", "rgb(201, 31, 46)");
  }
  await expect(page.getByText("Angsana Green, East Coast Park")).toBeVisible();
  await expect(page.getByText("Limited-edition event T-shirt for supporters.")).toBeVisible();
  await expect(page.getByText("Please collect your T-shirt during the published pickup window.")).toHaveCount(0);
  await expect(page.getByText("All net proceeds support cancer research in Singapore.")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Size charts" })).toHaveCount(0);

  await page.goto("/register");
  if ((page.viewportSize()?.width ?? 0) >= 900) {
    const registerNav = page.getByRole("link", { name: "Register", exact: true });
    await expect(registerNav).toHaveAttribute("aria-current", "page");
    await expect(registerNav).toHaveCSS("color", "rgb(201, 31, 46)");
  }
  await expect(page.getByText("Review this year's run details before completing registration.")).toBeVisible();
  await expect(page.getByText("Angsana Green, East Coast Park")).toBeVisible();
  await expect(page.getByText("2026 Terry Fox Run T-Shirt")).toBeVisible();
  await expect(page.getByText("$35.00 each")).toBeVisible();
  await expect(page.getByText("Please collect your T-shirt during the published pickup window.")).toBeVisible();
  await expect(page.getByText("All net proceeds support cancer research in Singapore.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Size charts" })).toBeVisible();
  await expect(page.getByText("I understand the risks of participating in the Terry Fox Run.")).toBeVisible();
  await expect(page.getByText("I consent to Terry Fox Run Singapore collecting my registration details for event operations.")).toBeVisible();
  await expect(page.getByText("T-shirt purchases and donations are non-refundable once confirmed.")).toBeVisible();
  const overviewBox = await page.getByRole("heading", { name: "Terry Fox Run Singapore, 2026" }).boundingBox();
  const shirtBox = await page.getByText("2026 Terry Fox Run T-Shirt").boundingBox();
  const payerBox = await page.getByRole("heading", { name: "Payer and primary participant" }).boundingBox();
  expect(overviewBox?.y ?? 0).toBeLessThan(shirtBox?.y ?? Number.POSITIVE_INFINITY);
  expect(shirtBox?.y ?? 0).toBeLessThan(payerBox?.y ?? Number.POSITIVE_INFINITY);
  await expect(page.getByRole("button", { name: "$0" })).toBeVisible();
  await page.getByRole("button", { name: "$0" }).click();
  await expect(page.getByLabel("Custom donation")).toHaveValue("0");
  await page.getByLabel("Custom donation").fill("50");
  await page.getByLabel("Name").first().fill("Alex Tan");
  await page.getByLabel("Email address").fill("alex@example.com");
  await page.getByLabel("NRIC / Passport / FIN").fill("S1234567A");
  await page.getByLabel("Blood type").fill("O+");
  await page.getByLabel("Address in Singapore").fill("1 Orchard Road, Singapore");
  await page.getByLabel("Primary M quantity").fill("1");
  await page.getByLabel(/I have read and agree to the indemnity, PDPA consent, and refund\/cancellation terms/).check();
  await page.getByRole("button", { name: "Continue to payment" }).click();

  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  await expect(page.getByText("TFR2026-12345")).toBeVisible();
  await page.getByRole("button", { name: "I have paid" }).click();
  await expect(page.getByText("payment screenshot is optional")).toBeVisible();
  await page.getByRole("button", { name: "I don't wish to upload" }).click();

  await expect(page).toHaveURL(/\/confirmation\?registrationId=123/);
  await expect(page.getByRole("heading", { name: "Thank you for supporting the Terry Fox Run SG 2026!!" })).toBeVisible();
  await expect(page.getByText("Transaction is pending manual verification")).toBeVisible();
});

test("dashboard and admin payment queue show payment status operations", async ({ page }) => {
  await page.goto("/dashboard?registrationId=123");
  await expect(page.getByRole("heading", { name: "My Events" })).toBeVisible();
  await expect(page.getByText("Pickup reminder")).toBeVisible();
  await expect(page.getByText("Waiting for payment confirmation.")).toBeVisible();
  await expect(page.getByText("Released after confirmation")).toBeVisible();

  await page.goto("/dashboard?registrationId=456");
  await expect(page.getByText("Payment confirmed")).toBeVisible();
  await expect(page.getByText("Terry Fox Run Singapore 2026")).toBeVisible();
  await expect(page.getByText("READY456")).toBeVisible();
  await page.getByRole("button", { name: "Receipt" }).click();
  await expect(page.getByRole("heading", { name: "Receipt" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Pickup instructions" }).click();
  await expect(page.getByRole("heading", { name: "Pickup instructions" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto("/volunteer");
  await expect(page.getByRole("heading", { name: "Volunteer Pickup" })).toBeVisible();
  await page.getByLabel("Pickup code").fill("READY456");
  await page.getByRole("button", { name: "Check pickup" }).click();
  await expect(page.getByText("READY FOR PICKUP.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mark collected" }).click();
  await expect(page.getByText("COLLECTED.", { exact: true })).toBeVisible();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Admin Portal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Event hub" })).toBeVisible();
  await expect(page.getByText("Confirmed amount raised")).toBeVisible();
  await expect(page.getByText("$85.00").first()).toBeVisible();

  await page.getByRole("tab", { name: "Registrations" }).click();
  await expect(page.getByText("Total registrations")).toBeVisible();
  await expect(page.getByText("Registrations over time")).toBeVisible();
  await page.getByLabel("Search registrations").fill("Alex");
  await expect(page.getByText("Alex Tan")).toBeVisible();

  await page.getByRole("tab", { name: "Payments" }).click();
  await page.getByLabel("Admin transaction ID / bank reference").fill("BANK-999");
  await page.getByRole("button", { name: "Confirm payment" }).click();
  await expect(page.getByText("Payment confirmed and inventory updated.")).toBeVisible();

  await page.getByLabel("Rejection reason").fill("Reference mismatch");
  await page.getByRole("button", { name: "Reject payment" }).click();
  await expect(page.getByText("Payment rejected. Inventory was not reduced.")).toBeVisible();

  await page.getByRole("tab", { name: "Announcements" }).click();
  await expect(page.getByText("Mass email", { exact: true })).toBeVisible();
  await expect(page.getByText("Confirmed participants")).toBeVisible();
  await page.getByLabel("Title").fill("Run day reminder");
  await page.getByLabel("Body", { exact: true }).fill("Bring water and your pickup code.");
  await page.getByRole("button", { name: "Create announcement" }).click();
  await expect(page.getByText("Announcement created.")).toBeVisible();
  await page.getByLabel("Subject").fill("Run update");
  await page.getByLabel("Email body").fill("See you at the run.");
  await page.getByRole("button", { name: "Save campaign" }).click();
  await expect(page.getByText("Email campaign saved.")).toBeVisible();

  await page.getByRole("tab", { name: "Corporate" }).click();
  await expect(page.locator('input[value="Bronze"]')).toBeVisible();
  await expect(page.getByLabel("Bronze M quantity")).toHaveValue("10");
  await expect(page.getByText("Acme Pte Ltd")).toBeVisible();
  await page.getByRole("button", { name: "Save corporate packages" }).click();
  await expect(page.getByText("Corporate packages saved.")).toBeVisible();

  await page.getByRole("tab", { name: "Registration Fields" }).click();
  await expect(page.getByRole("heading", { name: "Categories", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add category" }).click();
  await page.getByLabel("Category name").last().fill("Accessible 5K");
  await page.getByRole("button", { name: "Save categories" }).click();
  await expect(page.getByText("Categories saved.")).toBeVisible();

  await page.getByRole("tab", { name: "Event Setup" }).click();
  await expect(page.getByLabel("Indemnity wording")).toHaveValue("I understand the risks of participating in the Terry Fox Run.");
  await expect(page.getByLabel("PDPA consent wording")).toHaveValue("I consent to Terry Fox Run Singapore collecting my registration details for event operations.");
  await expect(page.getByLabel("Refund / cancellation wording")).toHaveValue("T-shirt purchases and donations are non-refundable once confirmed.");

  await page.getByRole("tab", { name: "Pickup" }).click();
  await expect(page.getByRole("heading", { name: "Pickup visibility" })).toBeVisible();
  await expect(page.getByText("READY456")).toBeVisible();

  await page.getByRole("tab", { name: "Roles" }).click();
  await expect(page.getByText("View Supabase Auth user roles.")).toBeVisible();
  await expect(page.getByText("harlanivikas@gmail.com")).toBeVisible();
  await expect(page.getByText("Admins", { exact: true })).toBeVisible();

  await page.getByRole("tab", { name: "Exports" }).click();
  await expect(page.getByRole("link", { name: "Registrations CSV" })).toHaveAttribute("href", /registrations\.csv/);
});
