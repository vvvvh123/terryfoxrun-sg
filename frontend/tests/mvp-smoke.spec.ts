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
      pickupCode: "PU-501",
      pickupStatus: "NOT_COLLECTED",
    },
  ],
  paymentAttempts: [paymentAttempt],
};

async function mockBackend(page: Page) {
  await page.route("http://127.0.0.1:8080/api/events", (route) => route.fulfill({ json: [event] }));
  await page.route("http://127.0.0.1:8080/api/events/current", (route) => route.fulfill({ json: event }));
  await page.route("http://127.0.0.1:8080/api/events/1", (route) => route.fulfill({ json: event }));
  await page.route("http://127.0.0.1:8080/api/events/1/categories", (route) => route.fulfill({ json: categories }));
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
  await page.route("http://127.0.0.1:8080/api/events/1/form-fields", (route) => route.fulfill({ json: [] }));
  await page.route("http://127.0.0.1:8080/api/admin/payment-attempts**", (route) => route.fulfill({ json: [paymentAttempt] }));
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
  await page.route("http://127.0.0.1:8080/api/registrations/123/payment-attempts", (route) => route.fulfill({ json: paymentAttempt }));
  await page.route("http://127.0.0.1:8080/api/admin/payment-attempts/20/confirm", (route) =>
    route.fulfill({ json: { ...paymentAttempt, verificationStatus: "CONFIRMED", adminTransactionId: "BANK-999" } }),
  );
  await page.route("http://127.0.0.1:8080/api/admin/payment-attempts/20/reject", (route) =>
    route.fulfill({ json: { ...paymentAttempt, verificationStatus: "PAYMENT_REJECTED", rejectionReason: "Reference mismatch" } }),
  );
  await page.route("http://127.0.0.1:8080/api/events/1/contact-submissions", (route) => route.fulfill({ json: { id: 1, status: "EMAIL_PREVIEW_CREATED" } }));
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

test("email login page starts Supabase magic-link sign in", async ({ page }) => {
  await page.route("https://lhpondhrhnjnimvyozdc.supabase.co/auth/v1/otp**", (route) => route.fulfill({ json: {} }));

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await page.getByLabel("Email address").fill("harlanivikas@gmail.com");
  await page.getByRole("button", { name: "Send sign-in link" }).click();

  await expect(page.getByText("Check your email for the sign-in link.")).toBeVisible();
});

test("public pages and mobile-first registration checkout flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Terry Fox Run Singapore, 2026" })).toBeVisible();
  await expect(page.getByText("Mobile-first registration")).toBeVisible();
  await page.goto("/terrys-story");
  await expect(page.getByRole("heading", { name: "One run inspired a movement." })).toBeVisible();

  await page.goto("/event");
  await expect(page.getByRole("heading", { name: "Terry Fox Run Singapore, 2026" })).toBeVisible();
  await expect(page.getByText("Angsana Green, East Coast Park")).toBeVisible();
  await expect(page.getByText("Limited-edition event T-shirt for supporters.")).toBeVisible();
  await expect(page.getByText("Please collect your T-shirt during the published pickup window.")).toHaveCount(0);
  await expect(page.getByText("All net proceeds support cancer research in Singapore.")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Size charts" })).toHaveCount(0);

  await page.goto("/register");
  await expect(page.getByText("2026 Terry Fox Run T-Shirt")).toBeVisible();
  await expect(page.getByText("$35.00 each")).toBeVisible();
  await expect(page.getByText("Please collect your T-shirt during the published pickup window.")).toBeVisible();
  await expect(page.getByText("All net proceeds support cancer research in Singapore.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Size charts" })).toBeVisible();
  await page.getByLabel("Name").first().fill("Alex Tan");
  await page.getByLabel("Email address").fill("alex@example.com");
  await page.getByLabel("NRIC / Passport / FIN").fill("S1234567A");
  await page.getByLabel("Blood type").fill("O+");
  await page.getByLabel("Address in Singapore").fill("1 Orchard Road, Singapore");
  await page.getByLabel("T-shirt quantity").fill("1");
  await page.getByLabel(/I agree to the indemnity and PDPA consent wording/).check();
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
  await expect(page.getByText("Waiting for payment confirmation")).toBeVisible();
  await expect(page.getByText("Released after confirmation")).toBeVisible();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Admin Portal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Event hub" })).toBeVisible();
  await expect(page.getByText("Alex Tan")).toBeVisible();
  await page.getByLabel("Admin transaction ID / bank reference").fill("BANK-999");
  await page.getByRole("button", { name: "Confirm payment" }).click();
  await expect(page.getByText("Payment confirmed and inventory updated.")).toBeVisible();

  await page.getByLabel("Rejection reason").fill("Reference mismatch");
  await page.getByRole("button", { name: "Reject payment" }).click();
  await expect(page.getByText("Payment rejected. Inventory was not reduced.")).toBeVisible();

  await page.getByRole("tab", { name: "Exports" }).click();
  await expect(page.getByRole("link", { name: "Registrations CSV" })).toHaveAttribute("href", /registrations\.csv/);
});
