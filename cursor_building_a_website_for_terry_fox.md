# Building a website for Terry Fox Run
_Exported on 09/05/2026 at 10:26:23 GMT+8 from Cursor (3.2.11)_

---

**User**

Hi there, 

I am looking to build a website for Terry Fox Run Singapore. We organise runs every year to raise money for charity.

Previously, we used to use a third party, 42race, to help us create a website where people sign up for the run. they would handle all the payments as well. The problem was that they were taking a large fee from us which would detract from the money we raised. 

I am hoping to create our own website so that we can save the fee money and host the sign up ourselves. 

Before we start building, I would like to have a back and forth discussion about this website we are building. 

I want to first decide two things:

1. The tech stack we should use. I haven't built many websites in the past, so looking for your guidance here. The website should look nice and appealing so hopefully we can use a stack with a frontend that already has templates and components that are nice. Also there will be both web and mobile users to the site so we need something that will support both of them well. 

2. The must have features of the website:

Since the website is built for signing up to events, this part is definitely a must have. We need to make it easy for people to sign up, integrate with the top payment providers. Once people sign up, they need to be able to look at their events, event details, event announcements (perhaps we can have push emails for this as well). Also for terry fox run, usually the runs will also have a t-shirt collection. So we need to support this functionality (Like ppl maybe have either a qr code or a code for t-shirt collection that they can give when they come to collect??)

We should definitely have a login functionality, etc, etc. 

What other features do you think are must have?

---

**Cursor**

Below is a practical starting point for the discussion. I’ve split it into two parts: (A) recommended tech-stack choices and (B) “must-have” feature set. At the end I list a few next steps so we can iterate.

--------------------------------------------------------------------
A.  Tech-stack recommendations
--------------------------------------------------------------------

1. Front-end
   • React (+ TypeScript) with a framework that gives routing, SEO, and server rendering out of the box.  
     – Next.js (Node‐centric) or Remix are the two most popular choices.  
     – Both ship with many free & paid template kits, so you can get an attractive landing page, event listing, etc. quickly.  
   • Styling/UI  
     – Tailwind CSS (utility-first, many component libraries like Flowbite & DaisyUI).  
     – OR Material-UI / Chakra-UI if you prefer a component-driven approach.  
   • Mobile support: Responsive design + enable “Add to Home Screen” PWA capabilities. This covers most users without building a separate native app.

2. Back-end
   Two viable directions depending on your familiarity & team skills:

   a) Java path (if you’re comfortable with Spring):  
      – Spring Boot + Spring Security for auth.  
      – Spring Data + JPA (or jOOQ) ↔ PostgreSQL.  
      – GraphQL (Spring for GraphQL) or REST.  
      – Flyway for DB migrations.  

   b) JavaScript/TypeScript path (keeps same language front & back):  
      – Next.js API routes or a dedicated Node server (Express / tRPC / NestJS).  
      – Prisma ORM ↔ PostgreSQL.  

   Either way, host-agnostic deployment (Docker containers on Fly.io, Railway, AWS Fargate, etc.) keeps cost low.

3. Payments
   • Stripe Checkout / Payment Links (has the broadest card & wallet support in SG, automatic fraud checks, refunds API).  
   • If you need PayNow QR, you can integrate HitPay or Stripe’s FPX‐style add-on.  
   • The fees are card-processing fees only; you avoid the platform surcharge you paid 42race.

4. Auth & user management
   • Auth0 or Clerk (outsourced) → quickest.  
   • OR roll your own (Spring Security / NextAuth.js) if you want full control but more effort.  
   • Social logins (Google, Apple) are a one-click addition in either approach.

5. Infrastructure
   • Vercel / Netlify (great for Next.js) for the front-end.  
   • Supabase or Railway for the Postgres database.  
   • Cloudflare Turnstile + rate limiting to mitigate bots at registration spikes.  
   • SendGrid / Postmark for email.

--------------------------------------------------------------------
B.  Must-have feature set for Terry Fox Run SG
--------------------------------------------------------------------

Core registration & payment
1. Event catalogue / landing page with event dates, fees, causes supported.
2. Registration flow
   • Select category (distance, T-shirt size, team vs individual).  
   • Checkout (Stripe one-page).  
   • Receipt & confirmation email.
3. Dynamic pricing support (early-bird, promo codes, corporate bulk).

Participant account
4. Secure login / sign-up (email + password, magic-link, socials).
5. “My Events” dashboard
   • Ticket/QR code and T-shirt pickup code (barcode or text).  
   • Event details, route map, start time.  
   • Announcements list (push to email + optionally web push).  
   • Ability to edit profile / transfer ticket (optional).

T-shirt / bib collection
6. Unique QR or short code displayed in dashboard & email PDF.
7. Check-in mobile web app for volunteers:
   • Scan QR → mark as collected (updates db, prevents reuse).  
   • Offline-first (caches scanned IDs, syncs when online).

Admin & operations
8. Admin portal with roles (event manager, volunteer).  
   • Live registration stats & export (CSV) for accounting.  
   • Bulk email / announcement sender (Mailchimp or built-in).  
   • T-shirt inventory, collection status.  
9. Financial report page pulling Stripe payouts, fees, net donations.

Compliance & security
10. PDPA/GDPR consent checkbox & privacy policy.  
11. HTTPS everywhere, 2-factor login for admins, regular DB backups, audit log.

“Nice-to-have soon”
12. Team fundraising pages & leaderboards.  
13. Donations without registration („I can’t run but want to donate“).  
14. Volunteer sign-up & shift scheduling.  
15. Multilingual i18n (English/Chinese/Malay/Tamil).  
16. Accessibility (WCAG 2.1 AA) – helps many runners.

--------------------------------------------------------------------
C.  Suggested next steps
--------------------------------------------------------------------
1. Confirm which back-end language you’re more comfortable maintaining (Java vs TypeScript).  
2. Decide whether to outsource authentication (Auth0/Clerk) or build it in-house.  
3. Pick a design system/template kit so we can sketch the initial screens.  
4. Map the data model (User, Event, Registration, Payment, Announcement, PickupStatus…).  
5. Create a sprint 0 backlog and a budget estimate for hosting + payment fees.

Let me know which of these points you’d like to deep-dive into first, or if you want alternative stack comparisons (e.g., WordPress + WooCommerce, no-code options, etc.).

---

**User**

1. Confirm which back-end language you’re more comfortable maintaining (Java vs TypeScript).

I have a lot more experience in Java and spring. But you had mentioned that using Typescript would keep the same language front & back, is this a big advantage?

Decide whether to outsource authentication (Auth0/Clerk) or build it in-house.

Is there any vulternabilities to outsource authentication? And what authentication is this for? User logins?

Pick a design system/template kit so we can sketch the initial screens.

Sorry what are the options for this?

Map the data model (User, Event, Registration, Payment, Announcement, PickupStatus…).

These are the tables that we need right? Okay I think we can do this later

Create a sprint 0 backlog and a budget estimate for hosting + payment fees.

Okay I think we can do this later

---

**Cursor**

Below I address each of the three immediate questions in turn.  
(Feel free to skip to the sections that matter most to you now.)

--------------------------------------------------------------------
1. Java + Spring vs. full-stack TypeScript  
--------------------------------------------------------------------
Pros of staying with Java (Spring Boot):
• Deep personal / team experience → higher productivity, fewer “unknown-unknowns”.  
• Mature, battle-tested ecosystem for security, observability, and enterprise features (Spring Security, Actuator, Micrometer, etc.).  
• Superior performance for CPU-heavy or multi-threaded tasks (unlikely to be critical here, but nice head-room).  
• You can still write the front-end in React/Next.js and communicate with Spring via REST or GraphQL. This is the most common combination in the Java world.

Pros of using the same language everywhere (TypeScript):
• Shared models and validation: with tRPC or GraphQL you can literally import the same TypeScript types on both client and server, eliminating duplicate DTO classes.  
• On-boarding: future hires who are JavaScript/TypeScript-first feel at home instantly.  
• Dev-ops simplicity: one runtime (Node) instead of JVM + Node for builds.  
• Huge selection of React-native backend utilities (NextAuth, Prisma, Blitz, …).

When the backend scope is relatively modest (basic CRUD around events + Stripe calls) the productivity gap between Spring and Node is small. Because you already know Spring, I would stay with Java unless:
1. You foresee most future contributors being JavaScript-centric, OR  
2. You absolutely want end-to-end type-sharing and don’t mind the extra learning curve.

Hybrid compromise: Spring Boot for core APIs, but write any lightweight “edge” functions (webhooks, scheduled email digests) as tiny TypeScript serverless functions on Vercel/Netlify. Many projects do this successfully.

--------------------------------------------------------------------
2. Outsourcing authentication (Auth0 / Clerk / Firebase Auth)  
--------------------------------------------------------------------
What “authentication” we mean: all login & sign-up flows for both participants and admins (email/password, social logins, password resets, multi-factor, session management, remember-me cookies, etc.).

Security/Vulnerability considerations:

1. Attack surface  
   • Outsourced auth vendors specialise in securing exactly this surface: credential storage, brute-force protection, bot detection, TLS config, etc.  
   • If you roll your own, you become responsible for OWASP Top-10 issues (injection, XSS, CSRF, rate-limiting, credential stuffing, …). Spring Security helps, but mis-configurations are common.

2. Data residency / compliance  
   • Vendors host user tables. Check where data is stored (Auth0 = region choice; Clerk EU availability; Firebase US-centric).  
   • For Singapore PDPA, as long as the provider has appropriate safeguards and consent is explicit, cross-border hosting is allowed. Still worth documenting.

3. Lock-in  
   • Vendor-specific user IDs and APIs. Migrating later requires an export procedure.  
   • Mitigation: stick to providers that allow raw user export (CSV/JSON) and expose OAuth2/OpenID-Connect standards.

4. Cost  
   • Auth0: Free up to 7k MAU, then ~USD 0.024 / MAU.  
   • Clerk & Firebase have similar “free tier → per-MAU” pricing.  
   • Rolling your own: mostly your dev time + email/SMS provider fees.

5. Feature depth  
   • Social logins, WebAuthn, MFA, suspicious-login alerts, breached-password detection come “for free” with SaaS.  
   • Building these yourself is non-trivial.

Typical middle ground: outsource participant auth (mass users, social logins, little PII beyond name/email) and keep an internal Spring-Security-backed LDAP/DB realm for admins if you need extra control.

--------------------------------------------------------------------
3. Design systems / template kits (front-end)  
--------------------------------------------------------------------
“Design system” = set of typography, colour, spacing rules, components (buttons, cards), and often Figma files.  
“Template kit” = pre-assembled pages you can clone (landing page, pricing page, blog, dashboard).

For React (Next.js, Remix, CRA), the following combinations work well:

1. Tailwind CSS + components library  
   • Flowbite React (MIT)  
   • DaisyUI (MIT)  
   • shadcn/ui (MIT, modern Radix-based)  
   • Tailwind UI (commercial, by Tailwind Labs) – polished, many templates including e-commerce checkout that can be adapted for event registration.

2. Headless UI libraries (you handle styling)  
   • Radix UI (high-quality accessibility)  
   • React-Aria / React-Spectrum by Adobe

3. Opinionated component libraries (style + logic bundled)  
   • Material-UI (MUI) – Google’s Material spec, rich data-table, date-picker, etc.  
   • Chakra UI – lighter, themeable, good for quick prototypes.  
   • Ant Design – enterprise-looking, heavy but feature-rich.  
   • Mantine – modern, supports SSR, good form utilities.

4. Off-the-shelf React templates  
   • Next.js Boilerplates on Vercel Marketplace (many free)  
   • Creative-Tim, Tailwind-Kit, HyperUI – one-time purchase, unlimited sites licence.  
   • If you go with Material-UI, look at “MUI Store” templates.

My recommendation for a non-designer team that still wants a polished look:  
Tailwind CSS + shadcn/ui (free) OR Tailwind UI (paid) + a ready-made “SaaS” template. It gets you fully responsive pages, dark-mode, and accessible components with minimal tweaking.

--------------------------------------------------------------------
Action items if you agree
--------------------------------------------------------------------
• Pick: “Spring Boot backend + React/Next.js front-end with Tailwind CSS + shadcn/ui” (or tell me you prefer something else).  
• Decide on auth: try Auth0 free tier for MVP; revisit self-host later.  
• Next step would be to sketch the core screens (Landing → Event Details → Checkout → Dashboard) and then draft the data model.

Let me know which of those you want to tackle next, or if anything above needs deeper explanation.

---

**User**

Yes let us go with Spring boot backend, and go with Auth0 for the authentication. 

I have very little front end knowledge so I will need to rely a lot for your help. Could you please suggest what you will be best be able to help with, easy for me to pick up, and look very polished?

---

**Cursor**

Below is a practical recommendation that balances “polished look”, “shallow learning-curve”, and “easy for me to coach you through”.

--------------------------------------------------------------------
Recommended front-end stack for you
--------------------------------------------------------------------
1. Framework: **Next.js (React + TypeScript)**
   • Out-of-the-box routing, SEO, image optimisation, and API routes.  
   • Huge ecosystem, great docs, free one-click hosting on Vercel.  
   • Works nicely with Spring Boot APIs (just call your JSON endpoints).

2. UI layer: **Material-UI (MUI)**  
   Why MUI over Tailwind or others for your case:
   • Everything is a pre-built, themeable React component (Button, Card, Stepper, DataGrid, etc.).  
   • You rarely touch CSS—most styling is just JS props (`color="primary"`, `variant="outlined"`).  
   • Rich template library (free + paid) so you start from a production-ready layout instead of a blank page.  
   • Excellent accessibility defaults.

3. Auth integration: **Auth0 React SDK**  
   • Official package (`@auth0/auth0-react`) gives you `useAuth0()` hook—log-in / log-out in two lines.  
   • Comes with sample Next.js repo; we’ll adapt it to your UI.

4. Charts / maps (for dashboards & route maps)  
   • `@mui/x-charts` or `recharts` for stats.  
   • `react-leaflet` for displaying the running route if needed.

5. State & API calls  
   • `react-query` (TanStack Query) keeps API code minimal and handles caching/refetch for you.  
   • Axios or the native `fetch` for the actual HTTP calls to Spring Boot.

6. Tooling / quality of life  
   • ESLint + Prettier (Next.js sets these up automatically).  
   • Storybook (optional) if we want an isolated “component workbench”.  
   • Cypress or Playwright later for end-to-end tests.

--------------------------------------------------------------------
Why this combo is beginner-friendly
--------------------------------------------------------------------
• You write almost no CSS—visual polish comes from MUI defaults + their theme generator.  
• Theming & branding is a live JSON editor; you see colours update instantly.  
• Copy/paste from MUI docs works 1-to-1: the docs are code-sandboxes you can rerun locally.  
• If you get stuck, I can supply a ready-made code snippet or tweak MUI props instead of debugging flex-boxes.

--------------------------------------------------------------------
Concrete next steps (very short learning curve)
--------------------------------------------------------------------
1. Install the starter:
   ```
   npx create-next-app@latest terry-fox-run-sg --typescript --eslint --src-dir
   cd terry-fox-run-sg
   yarn add @mui/material @emotion/react @emotion/styled @mui/icons-material
   ```
2. Drop in the Auth0 sample:
   ```
   yarn add @auth0/auth0-react
   ```
   and wrap `<Auth0Provider>` around your root component—5 lines of code.

3. Import an MUI template:
   • Free: `muitheme.com` – choose “Dashboard” or “Landing Page”, download the ZIP, copy the `pages` & `components` folders.  
   • Paid (USD 59 one-time): “Material-UI Store – Next.js Full-stack Kit”. Comes with auth, dashboard, settings pages already wired; we just replace their Firebase calls with your Spring endpoints.

4. Replace hard-coded placeholders with live data via `react-query + axios` talking to `https://api.yourdomain.sg/api/events`, etc.

5. Deploy:
   • Push to GitHub → Vercel import wizard → public URL in 2 min.

I’m happy to walk you through each of these steps, supply code fragments, or pair-review anything you push.  
If at any point you feel like the styling abstractions are limiting, we can switch to Tailwind + shadcn/ui, but in practice teams with limited front-end experience ship faster with Material-UI.

Let me know if you’re comfortable starting with this setup, or if you’d like a hands-on mini-tutorial to get the starter running locally.

```plaintext
   npx create-next-app@latest terry-fox-run-sg --typescript --eslint --src-dir
   cd terry-fox-run-sg
   yarn add @mui/material @emotion/react @emotion/styled @mui/icons-material
```

```plaintext
   yarn add @auth0/auth0-react
```

---

**User**

Can you help me get started with the project

---

**Cursor**

Of course. Let's get the foundation of your project set up. I'll create a folder structure with a `frontend` directory for your Next.js application and a `backend` directory for your Spring Boot application.

First, I will set up the Next.js frontend. I'll use the `create-next-app` command to bootstrap a new Next.js project with TypeScript and ESLint, as we discussed.

---

**User**

we will be using material UI right?

---

**Cursor**

You are absolutely right! My apologies. I got ahead of myself and included Tailwind in the command, but we did decide on Material-UI. Thanks for catching that. MUI is a better choice here because it provides more pre-built components out of the box, which will be easier for you to assemble.

Let's start over with the correct command. I will create the Next.js application *without* Tailwind CSS this time.

It seems like the `npx` command isn't available in your shell's path. This command is part of the Node.js toolkit and is necessary to run the `create-next-app` script.

This usually happens if Node.js isn't installed or if the shell isn't configured correctly to find it.

Let's check if you have Node.js and `npm` (Node Package Manager) installed. I'll run a command to see their versions.

Okay, that confirms it. You don't have Node.js installed, which is why the previous commands failed.

No problem at all, we can install it now. The most common way to install development tools on a Mac is using a package manager called Homebrew. It makes managing software like Node.js very simple.

First, let's check if you have Homebrew installed.

Excellent, you have Homebrew. Now I'll use it to install Node.js. This will give us `node`, `npm`, and `npx`.

Great, Node.js is now installed.

Now we can get back to creating your frontend application. I'll run the command to create a new Next.js project named `frontend`.

It looks like the script is asking you for input in your terminal. Please answer "No" to the Tailwind CSS question, and then press Enter to continue.

Once the `frontend` directory is created, I will proceed with installing the necessary libraries for Material-UI and authentication.

First, I'll check if the `frontend` directory has been created.

It seems the `frontend` directory hasn't been created yet. Please make sure to answer the questions in the terminal where `create-next-app` is running.

Specifically, when you see this prompt, choose **No**:

```
? Would you like to use Tailwind CSS? › No / Yes
```

Let me know once the script has finished and you see the `frontend` folder in your project. I'll then proceed with installing Material-UI and Auth0.

```plaintext
? Would you like to use Tailwind CSS? › No / Yes
```

---

**User**

its asking if I want to use turbopack for next dev

---

**Cursor**

Go ahead and select **"No"** for now.

Turbopack is a new, much faster replacement for the standard development server, but it's still relatively new. For learning and for ensuring everything works as expected with all libraries (like Material-UI), it's safer to stick with the default, stable setup.

You can always enable Turbopack later on if you feel the development server is slow, but for a project this size, you likely won't need it.

Let me know once it's finished

---

**User**

i accidentally clicked yes for tailwind css

---

**Cursor**

No problem, that's easy to fix. We'll just remove the Tailwind-related files and packages, and then add Material-UI.

First, I'll delete the two configuration files that Tailwind created: `tailwind.config.ts` and `postcss.config.mjs`.

It seems I made a mistake with the first file name, but the second one (`postcss.config.mjs`) was deleted successfully. Let me look inside the `frontend` directory to find the correct name for the Tailwind config file and see what other cleanup is needed.

Ah, it seems `create-next-app` has changed its output recently and doesn't always create a `tailwind.config.ts` file in the same way, especially if it's part of the initial setup. My apologies. The important thing is that `postcss.config.mjs` is gone.

Now, I need to remove the Tailwind directives from the main CSS file. I'll read `src/app/globals.css` to see its contents.

Okay, I see the `@import "tailwindcss";` and other `@theme` directives. I'll remove all of that and replace it with a clean slate, just keeping a basic body style. This will completely remove Tailwind's influence from your project's styling.

```css
body {
  font-family: Arial, Helvetica, sans-serif;
}

```

Now that the CSS is cleaned up, the final step is to remove the Tailwind-related packages from your `package.json` file. I'll read the file first to see the exact dependencies that were added.

Okay, I see the packages to remove: `tailwindcss` and `@tailwindcss/postcss`.

I'll now run `npm uninstall` to remove them from your project's `node_modules` and `package.json`.

Perfect. We have now completely removed Tailwind CSS from the project.

Now, let's install Material-UI and its required dependencies (`@emotion/react`, `@emotion/styled`, and `@mui/icons-material`).

Great, Material-UI is installed.

Next, we need to set up a custom theme and make it available to all the pages in your application. This involves creating a `ThemeRegistry` component that will handle server-side rendering of styles correctly.

First, I'll create a new file `frontend/src/components/ThemeRegistry.tsx` to hold this logic. This is a standard setup for using MUI with the Next.js App Router.

```typescriptreact
// src/components/ThemeRegistry.tsx
'use client';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import React from 'react';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache({ key: 'mui' });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}

```

Now that the `ThemeRegistry` is created, we need to apply it to the root layout of the application. This ensures all pages will inherit the Material-UI theme.

I will edit `frontend/src/app/layout.tsx` to import and wrap the main content with our new `ThemeRegistry`.

```typescriptreact
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}

```

Finally, let's replace the default content of the homepage with a simple Material-UI button to verify that everything is working correctly.

I will edit `frontend/src/app/page.tsx` to include an MUI `Button` and `Typography` component.

```typescriptreact
import { Button, Typography } from "@mui/material";

export default function Home() {
  return (
    <main>
      <Typography variant="h3">Welcome to the Terry Fox Run SG Site</Typography>
      <Button variant="contained">Sign Up</Button>
    </main>
  );
}

```

We've successfully:
1.  Created a Next.js project.
2.  Removed the accidental Tailwind CSS installation.
3.  Installed and configured Material-UI with a basic theme.
4.  Added a sample Material-UI button to the homepage to confirm the setup.

The frontend project is now ready. You can start the development server to see the result. I'll run the command for you. After it starts, you can open `http://localhost:3000` in your browser.

The development server is now running. You should be able to open `http://localhost:3000` in your web browser and see a page with the heading "Welcome to the Terry Fox Run SG Site" and a Material-UI "Sign Up" button.

This gives us a solid foundation for the frontend.

What would you like to do next? We can:
1.  Start setting up the Spring Boot backend project.
2.  Begin building out the frontend pages (e.g., creating a proper header, a landing page section).
3.  Set up the Auth0 integration for user login.

---

**User**

could you please help me relaunch the development server?

---

**Cursor**

Dev server is up and running in the background on `http://localhost:3000`.

Notes:
- I rebuilt `node_modules` (they were giving permission errors) and started the server with a project-local npm cache to avoid the earlier logging issue.
- If you want to stop it, go to the terminal running the command and press `Ctrl+C`.

Want me to open a landing page layout next or wire up Auth0?

---

**User**

first can we discuss the high level design?



how do you envision the different pages of the website?



1. how will we support signing up for the run?

2. how will the t shirt collection work?

3. can we make it easy to reuse the website for each year's run?

---

**Cursor**

Here’s a pragmatic high-level design broken into pages/flows, plus answers to your three questions.

Site/page map (public + participant + admin)
- Landing/Home: hero (cause, date, CTA), event highlights, route map, FAQs, sponsors, donation CTA, newsletter signup.
- Event detail: categories (5K/10K/virtual), pricing tiers, T-shirt sizes, cutoff dates, rules, start/finish locations, map, schedule.
- Registration flow: (1) select category/quantity, (2) participant details (name, email, phone, emergency contact, T-shirt size), (3) review, (4) pay via Stripe (card, Apple Pay/Google Pay).
- Confirmation: receipt + order summary + “View my dashboard” + email with QR/ticket.
- Participant dashboard (requires login): list of registrations, each with QR/ticket, event details, announcements, T-shirt pickup code/QR, payment status, ability to download receipt, update certain fields (e.g., shirt size until cutoff).
- Announcements: feed in dashboard; email push for important updates (rain plan, bib pickup reminders).
- Donation page (optional): donate without registering; card wallet flow + receipt.
- Contact/help: support form, policies (PDPA/privacy/terms), waivers.

Admin/volunteer side
- Admin portal: create/edit events, categories, pricing, promo codes; registration list/export; announcement sender; inventory; financial summary (Stripe payouts/net); role-based access.
- Pickup/check-in app: simple mobile-friendly page to scan QR / enter code → mark as collected; shows shirt size and status; supports offline queueing (optional).

1) How we support signing up for the run
- Flow: Landing CTA → Event detail → Registration form (category, shirt size, waiver consent) → Stripe Checkout → Redirect back to confirmation.
- Tech: Spring Boot REST/GraphQL API for events/registrations; Next.js consumes it. Stripe Checkout for payments (lowest effort, strong PCI posture). Webhook in Spring to confirm payment and mark registration as paid.
- Features: promo codes/early-bird pricing, team vs individual (optional), receipts emailed via SendGrid/Postmark, rate limiting + bot protection on registration endpoint.

2) How T-shirt collection works
- On successful payment, generate a unique pickup token (short code + QR) stored with registration.
- Surfaces: emailed in confirmation; visible in participant dashboard; downloadable PDF (optional).
- Pickup flow: volunteer scans QR or types code in the pickup page → API marks status “collected” and timestamps; prevents reuse.
- Inventory: admin can see counts by size and collected status; optional “switch size” button that decrements/increments counts.
- Offline-friendly option: pickup page caches the queue of scanned codes and syncs when online (nice-to-have, can be v2).

3) Making it easy to reuse each year
- Config-driven events: store event metadata (name/year/dates/pricing/categories/cutoffs) in the database; no code changes per year.
- Multi-event support: allow multiple “active” events; landing highlights the current one, but dashboard keeps past registrations.
- Theming/content: pull hero text, FAQs, sponsor logos, and key dates from CMS-like fields (can be managed via admin UI).
- Archival: keep prior-year announcements and results, but default views show the current year.
- Re-run workflow: clone last year’s event, adjust dates/pricing/shirt sizes, upload new assets; open/close registration via status flags.

Suggested next steps
- Lock the initial page set: Landing, Event detail, Registration, Confirmation, Dashboard (with QR/pickup + announcements), Admin (basic CRUD + pickup tool).
- Decide on team vs individual registration for v1 (team adds complexity to forms/payments).
- Define required fields for registration and waivers.
- Then we can draft the data model (Event, Category, Registration, Payment, Announcement, PickupToken) and the initial API contracts.

---

**User**

Awesome this sounds amazing. It sounds like u've really considered the details. 



let's start with the suggested next steps. what info do u need from me?

---

**Cursor**

Great—let’s gather the minimum decisions so we can lock the initial spec and data model. If you’re short on time, just answer the starred items; we can default the rest.

1) Registration model
- *Individual vs team registrations?* (If team: max team size? one payment per team? team name required?)
- *Required fields per participant:* name, email, phone, emergency contact name/phone, date of birth, gender, T-shirt size, waiver consent. Any extras (NRIC/ID last 4, medical notes, address)?
- *Waiver text:* do you have a standard waiver/PDPA consent, or should we draft a simple one for review?
- Capacity: is there a cap per category (e.g., 5K capped at 3,000) or overall?

2) Event setup
- *Categories:* e.g., 5K fun run, 10K, virtual. Any kids or wheelchair categories?
- *Pricing & tiers:* base price per category, early-bird dates, promo codes (single-use/percentage/flat).
- Key dates: registration open/close, shirt pickup dates, event date/time, shirt size cutoff date.
- Locations: start/finish venue and pickup venue (if different).

3) Payments
- *Payment methods:* Stripe card + Apple Pay/Google Pay okay? Need PayNow or bank transfer option?
- Currency: SGD?
- Do you need tax invoice fields (company name, address, UEN) for corporate entries?

4) T-shirt & pickup
- *Sizes offered:* XS-XXL? Youth sizes?
- Inventory tracking: do we enforce stock or just “soft” tracking?
- Pickup windows/locations: how many days/slots?
- Allow size changes after purchase (until cutoff)?

5) Announcements & comms
- Channels: email + in-dashboard feed? (SMS later?)
- From-address/domain you want to use for email (e.g., noreply@terryfoxrun.sg)? We’ll need DNS access later.

6) Admin roles & ops
- Who needs admin access? (roles: admin, registrar, volunteer pickup)
- Exports: CSV of registrations? Donation reports?
- Onsite pickup flow: QR scan only, or also manual code entry?

7) Yearly reuse
- Do you want to show past events on the public site, or just in a “Past runs” page?
- Should the landing auto-highlight the “current” event based on dates, or be manually selected in admin?

8) Branding / UI starter
- Colors/logo/fonts: do you have brand assets? If not, I’ll start with a simple red/white/black palette and drop in placeholders.

Once we have these, I’ll propose the v1 page list, API contracts, and data model (Event, Category, Registration, Payment, Announcement, PickupToken) and we can start scaffolding the backend and wiring the frontend forms.

---

**User**

1) Registration model



Individual vs team registrations? (If team: max team size? one payment per team? team name required?)



Can you make it individual registrations, but allow the option for one person to add multiple people to register? Like they would still have to fill in the details for each person. 

Required fields per participant: name, email, phone, emergency contact name/phone, date of birth, gender, T-shirt size, waiver consent. Any extras (NRIC/ID last 4, medical notes, address)?



Yes to all of the ones u mentioned.



For registering, the participant doesn't HAVE to buy a t-shirt. but if they choose to buy a t-shirt then they will need to select a size (we can let them buy multiple t-shirts with different sizes). 



Waiver consent: not sure for now, we can exclude for now. 



NRIC/ID last 4: yes needed



Medical notes: optional field please. 



Address: Yes needed. 



Can we please make like registering for a new event customisable? So all the fields above, they are customisable to be enabled or disabled whether we want them or not. (Or is this too complicated?)



Waiver text: do you have a standard waiver/PDPA consent, or should we draft a simple one for review?



We can skip the waiver for now. 



Capacity: is there a cap per category (e.g., 5K capped at 3,000) or overall?



No cap

2) Event setup

Categories: e.g., 5K fun run, 10K, virtual. Any kids or wheelchair categories?



5K and 10K runs. But can we make this customisable? But actually will always just be 5K and 10K fun runs

Pricing & tiers: base price per category, early-bird dates, promo codes (single-use/percentage/flat).



Pricing: We usually sell the t-shirt for $35. But we also want to push participants to donate extra. But if participants don't want a t-shirt, they can choose to not donate / donate any amount. 



Key dates: registration open/close, shirt pickup dates, event date/time, shirt size cutoff date.



TBD. But my vision is that the admin panel of the website would be able to add events rather than it being static. What do you think of this plan? But for like the landing pages, those we can modify. But for the registering of the event, we can try to make that customisable and addable via admin panel? For now we can keep placeholder dates. 



Locations: start/finish venue and pickup venue (if different).



TBD: can use placeholder for now. 

3) Payments

Payment methods: Stripe card + Apple Pay/Google Pay okay? 

Need PayNow or bank transfer option?

Currency: SGD?



Currency SGD yes. 

For now Stripe card + apple pay / google pay is enough. I think PayNow may be complicated to add, so we can skip for now and consider adding in the future? Bank transfer not needed



Do you need tax invoice fields (company name, address, UEN) for corporate entries?



Yes we do. Can we have a separate registration option for corporate? 

4) T-shirt & pickup

Sizes offered: XS-XXL? Youth sizes?



XS to XXXL - Adult

XS to L - Kids sizes



we have both adult and kids sizes



Inventory tracking: do we enforce stock or just “soft” tracking?



Can we add enforcement please. And then let the admin panel modify the quantity left. 

Pickup windows/locations: how many days/slots?



Usually one weekend. Can we let admin panel configure?



Allow size changes after purchase (until cutoff)?



No size changes allowed



5) Announcements & comms

Channels: email + in-dashboard feed? (SMS later?)



Yes email + in-dashboard feed is enough

From-address/domain you want to use for email (e.g., noreply@terryfoxrun.sg)? We’ll need DNS access later.



(let me get back about the email address domain, or we can use my personal email for now

6) Admin roles & ops

Who needs admin access? (roles: admin, registrar, volunteer pickup)



We need an overall admin, volunteer role (to support t shirt pick up), and participant role



Exports: CSV of registrations? Donation reports?



Yes that sounds good. Can we also have a dashboard / list to visualise on the website itself (from admin panel)

Onsite pickup flow: QR scan only, or also manual code entry?



Both I think

7) Yearly reuse

Do you want to show past events on the public site, or just in a “Past runs” page?



In a past runs page is enough

Should the landing auto-highlight the “current” event based on dates, or be manually selected in admin?



manually selected in admin

8) Branding / UI starter

Colors/logo/fonts: do you have brand assets? If not, I’ll start with a simple red/white/black palette and drop in placeholders.



Red/White/Black/Dark-Blue colour palette sounds nice!



Once we have these, I’ll propose the v1 page list, API contracts, and data model (Event, Category, Registration, Payment, Announcement, PickupToken) and we can start scaffolding the backend and wiring the frontend forms.

---

**Cursor**

Great, thanks for the detailed inputs. Here’s the consolidated plan and what I’ll propose next.

What you decided (concise)
- Registration: Individual flow, but one payer can register multiple participants in one checkout. Required per participant: name, email, phone, emergency contact (name/phone), DOB, gender, address, NRIC/ID last 4, T-shirt size only if purchasing shirts. Medical notes optional. Waiver: skip for now.
- Shirts: Purchase optional. Multiple shirts per registration, mixed sizes. Sizes: Adult XS–XXXL, Kids XS–L. Enforce inventory; admin can adjust quantities. No size changes after purchase.
- Events/Categories: 5K and 10K fun runs (can remain configurable but likely fixed to these two). No capacity cap.
- Pricing/Donations: Shirt SGD 35. Encourage extra donation; if no shirt, donation optional. Stripe (card + Apple/Google Pay) only; PayNow/Bank transfer later. Currency SGD. Corporate option with tax invoice fields (company name, address, UEN).
- Dates/Locations: TBD; should be admin-configurable (open/close reg, event date/time, pickup dates, pickup location). Landing text editable; admin can add events.
- Announcements: Email + in-dashboard feed.
- Admin roles: Admin (full), Volunteer (pickup/check-in), Participant. Exports (CSV), plus on-site dashboard. Pickup supports QR scan + manual code entry.
- Yearly reuse: Past runs page; current event manually selected in admin.
- Branding: Red/White/Black/Dark-Blue palette; placeholder assets for now.

Approach to configurability
- Per-event config flags for fields (e.g., require_address, require_nric_last4, allow_shirt_purchase, allow_donation, require_emergency_contact, require_gender, require_dob, allow_medical_notes). This keeps future events flexible without code changes.
- Categories are data-driven; we’ll seed 5K/10K but allow CRUD in admin (with a “recommended default” toggle).

Proposed v1 pages/flows
- Public: Landing, Event Detail (for current event), Registration wizard (multi-participant), Confirmation.
- Auth: Login/Signup via Auth0.
- Participant Dashboard: My registrations, QR/ticket & pickup code, shirts ordered, announcements feed, receipts.
- Admin: Event & category management, inventory (shirt sizes), registrations list + CSV export, announcements sender, pickup/check-in tool (QR + manual code), dashboard cards (counts, revenue, shirts remaining).
- Past Runs: Simple list/detail.

Initial data model (v1)
- User(id, auth0_sub, role: admin|volunteer|participant, name, email, phone, address, created_at)
- Event(id, name, year, is_current, status, reg_open, reg_close, event_start, event_end, pickup_start, pickup_end, location_event, location_pickup, branding, field_flags JSON)
- Category(id, event_id, name, description, base_price, donation_min, is_active)
- Registration(id, event_id, user_id (payer), total_amount, payment_status, payment_intent_id (Stripe), created_at)
- RegistrationParticipant(id, registration_id, category_id, name, email, phone, emergency_contact_name/phone, dob, gender, address, nric_last4, medical_notes, tshirt_size (nullable), tshirt_type (adult/kid), tshirt_qty, pickup_token, pickup_qr, pickup_status, pickup_timestamp)
- ShirtInventory(id, event_id, size, type (adult/kid), quantity_available, quantity_reserved)
- Announcement(id, event_id, title, body, channel_email, channel_dashboard, created_by, created_at)
- Payment(id, registration_id, stripe_payment_intent_id, amount, currency, status, created_at)
- CorporateInfo(id, registration_id, company_name, company_address, uen)
- AuditLog(id, actor_user_id, action, entity, entity_id, metadata, created_at)

Key API/flow decisions
- Registration flow: client builds a cart of participants (+ shirts/donations), calls backend to create a pending registration + line items → Stripe Checkout session → webhook marks paid + confirms registrations and reserves shirts atomically.
- Pickup tokens: generated per participant; surfaced in dashboard + email; validated by a lightweight pickup endpoint with role=volunteer.
- Inventory enforcement: check + reserve before payment; finalise on successful webhook; release on failure/expiry.

What I need from you (to proceed with specs/scaffolding)
- Confirm the field-flags approach (per-event configurable required/optional flags).
- Confirm that two categories (5K/10K) seeded by default is sufficient, with admin able to add more if needed.
- Confirm donation UX: default to SGD 0 if no shirt; allow custom amount field; suggested preset amounts?
- Confirm shirt pricing: Shirt SGD 35 per unit (regardless of adult/kid), correct?
- Corporate flow: separate toggle in form (“This is a corporate registration”) to collect company name, address, UEN—one payer still, per-participant details still required. OK?
- Email domain: temporary personal email is fine for now; we’ll wire SendGrid/Postmark later.

If the above looks good, I’ll draft:
- v1 API contracts (REST endpoints) for Events, Categories, Registrations, Payments (Stripe), Announcements, Pickup.
- Seed data + configs for the initial event.
- A minimal UI outline for the registration wizard and dashboard.

---

**User**

Confirm the field-flags approach (per-event configurable required/optional flags).



Yes, per-event configurable sounds good. With required and optional flags. 

Confirm that two categories (5K/10K) seeded by default is sufficient, with admin able to add more if needed.



Yes, and can enable/disable 5K and 10K option if need be. 

Confirm donation UX: default to SGD 0 if no shirt; allow custom amount field; suggested preset amounts?



suggested preset = 20, 50, 100

Confirm shirt pricing: Shirt SGD 35 per unit (regardless of adult/kid), correct?



yes correct. For the t-shirt sizes, can we make it admin configurable when they add a registration event?



Corporate flow: separate toggle in form (“This is a corporate registration”) to collect company name, address, UEN—one payer still, per-participant details still required. OK?



Per-participant details not required. I think for corporate, we can skip payment, we will separately send them the payment details for bank transfer. But this is more for allowing them to register the t-shirt size selection.

Email domain: temporary personal email is fine for now; we’ll wire SendGrid/Postmark later.



harlanivikas@gmail.com





---

**Cursor**

Got it. Here’s the updated plan with your confirmations applied and a few clarifications, then I’ll move to drafting the v1 API contracts and UI outline.

What we’re locking in now
- Field flags (per-event): each field can be required/optional/hidden. Admin config drives the registration form per event.
- Categories: seed 5K and 10K; admin can enable/disable or add more.
- Donation UX: default SGD 0 if no shirt; custom amount allowed; presets: 20/50/100.
- Shirt pricing: SGD 35 per unit (adult or kid). Shirt size list is admin-configurable per event (so you can change available sizes or hide some).
- Corporate flow: toggle “Corporate registration”. For corporate, skip online payment (payment handled offline); collect corporate info (company name, address, UEN) and allow shirt size selections. Per-participant details are NOT required in corporate flow (just shirt sizes/quantities). If you want an optional contact person for corporate orders, say so.
- Email sender (for now): harlanivikas@gmail.com.

Quick clarifications to finalize before specs
- Corporate flow:
  - Do you want to capture a single contact name/email/phone for the corporate order? (Recommended so we know who to liaise with.)
  - Should corporate be limited to shirts only (no event entries), or can they also register runners without payment (i.e., reserve spots)? You said no payment and mainly for shirt size selection—so I’ll treat it as “shirt order only” unless you want otherwise.
- Shirt size configuration: by default we’ll offer Adult XS–XXXL and Kids XS–L; admin can toggle which sizes are available and set per-size inventory.

Next steps I’ll deliver
1) Data model + API contracts (REST):
   - Events (with field flags, shirt sizes, current-event toggle)
   - Categories
   - Registrations (multi-participant), Donations, Stripe Checkout session + webhook
   - Corporate orders (no payment, shirt sizes + corporate info)
   - Announcements
   - Pickup (QR + code)
   - Inventory endpoints for shirts
2) Minimal UI outline:
   - Registration wizard (individual + multi-participant; corporate toggle path)
   - Participant dashboard
   - Admin screens (events/categories, inventory, announcements, pickup tool, exports)
3) Seed defaults:
   - Event with 5K/10K enabled
   - Shirt sizes adult/kid
   - Donation presets 20/50/100
   - Shirt price 35

If the corporate clarifications above sound good, I’ll draft the endpoints and the screen flow next.

---

**User**

Corporate flow:



Do you want to capture a single contact name/email/phone for the corporate order? (Recommended so we know who to liaise with.)



Yes

Should corporate be limited to shirts only (no event entries), or can they also register runners without payment (i.e., reserve spots)? You said no payment and mainly for shirt size selection—so I’ll treat it as “shirt order only” unless you want otherwise.



Yes shirt order only

Shirt size configuration: by default we’ll offer Adult XS–XXXL and Kids XS–L; admin can toggle which sizes are available and set per-size inventory.



Yes sounds great

---

**Cursor**

Perfect. I’ll move forward with the specs using those corporate rules. Below is a concise blueprint: data model highlights, REST API contracts, and UI flow outline. This is implementation-ready guidance for the Spring Boot backend + Next.js frontend.

## Data model (key tables/entities)
- User: id, auth0_sub, role (admin | volunteer | participant), name, email, phone, address, created_at.
- Event: id, name, year, is_current, status (draft/open/closed), reg_open/reg_close, event_start/event_end, pickup_start/pickup_end, location_event, location_pickup, field_flags (JSON for required/optional/hidden), donation_presets, shirt_sizes config (list of allowed sizes/types), branding (colors, hero text), created_at.
- Category: id, event_id, name (5K/10K default), description, base_price (for entry), is_active.
- Registration: id, event_id, payer_user_id, total_amount, payment_status (pending/paid/failed), stripe_payment_intent/session ids, created_at.
- RegistrationParticipant: id, registration_id, category_id, name, email, phone, emergency_contact_name/phone, dob, gender, address, nric_last4, medical_notes, tshirt_size (nullable), tshirt_type (adult/kid), tshirt_qty (for that participant), pickup_token, pickup_qr, pickup_status, pickup_timestamp.
- Donation: id, registration_id, amount.
- ShirtInventory: id, event_id, size, type (adult/kid), quantity_available, quantity_reserved, quantity_sold.
- Announcement: id, event_id, title, body, channel_email, channel_dashboard, created_by, created_at.
- Payment: id, registration_id, amount, currency, status, provider_id (Stripe), created_at.
- CorporateOrder: id, event_id, company_name, company_address, uen, contact_name, contact_email, contact_phone, status (pending/confirmed), created_at.
- CorporateOrderItem: id, corporate_order_id, size, type (adult/kid), quantity.
- AuditLog: id, actor_user_id, action, entity, entity_id, metadata, created_at.

## Field flags (per-event)
- Flags for required/optional/hidden: address, nric_last4, emergency_contact, dob, gender, medical_notes, allow_shirt_purchase, allow_donation, allow_corporate, require_auth (for reg), etc.
- Admin can toggle available shirt sizes and donation presets per event.

## REST API contracts (v1)
Base: `/api`

Auth: via Auth0 access token (RS256) → Spring Security resource server.

Events & categories
- GET `/events/current` → current event + categories + flags + sizes + donation presets.
- GET `/events/:id`
- GET `/events/:id/categories`
- POST `/events` (admin)
- PATCH `/events/:id` (admin) – update flags, dates, sizes, presets, is_current.
- POST `/events/:id/categories` (admin)
- PATCH `/categories/:id` (admin)
- (Optional) POST `/events/:id/set-current` (admin convenience)

Registrations (individual + multi-participant)
- POST `/registrations/quote`  
  Body: event_id, participants[], donation_amount, shirts[] (if any).  
  Returns: price breakdown, inventory check.
- POST `/registrations`  
  Body: event_id, participants[], donation_amount, shirts[]; creates pending registration + line items; returns registration_id and Stripe Checkout session URL/id.
- POST `/payments/stripe/webhook` (no auth; signed)  
  On success: mark registration paid, reserve/sell shirts, generate pickup tokens, send email.
- GET `/registrations/me` (participant) – list with status, tickets, pickup tokens.
- GET `/registrations/:id` (owner/admin)
- (Optional) PATCH `/registrations/:id/cancel` (policy-dependent; likely no cancellations for runs)

Participants schema (per participant)
- name, email, phone, emergency_contact_name/phone, dob, gender, address, nric_last4, medical_notes (optional), category_id, tshirt_size/type/qty (nullable), waiver_consent (omitted now).

Donations
- Included in registration payload; stored as Donation row; counted in totals.

Corporate orders (no online payment)
- POST `/corporate-orders`  
  Body: event_id, company_name, company_address, uen, contact_name/email/phone, items[] (size, type, qty).  
  Status = pending; no Stripe.  
  Returns order_id + summary.
- GET `/corporate-orders` (admin)
- GET `/corporate-orders/:id` (admin)
- PATCH `/corporate-orders/:id` (admin) – update status/notes.

Announcements
- GET `/events/:id/announcements` (public for event feed or participant dashboard)
- POST `/events/:id/announcements` (admin) – with channel flags.

Pickup (volunteer/admin)
- POST `/pickup/scan`  
  Body: token or code.  
  Returns participant name, category, shirt size/type, status.  
  Marks collected with timestamp; idempotent.
- (Optional) GET `/pickup/verify/:token` (read-only check)

Inventory (admin)
- GET `/events/:id/inventory`
- PATCH `/events/:id/inventory` – adjust per-size quantities.

Exports (admin)
- GET `/events/:id/registrations.csv`
- GET `/events/:id/corporate-orders.csv`
- GET `/events/:id/finance.csv` (optional; Stripe data summary)

## Frontend UI outline (Next.js + MUI)
Public
- Landing: hero, CTA to “Register”, highlights, route map, FAQs, sponsors, donation CTA.
- Event detail: date/time, venue, categories, pricing, donation presets, shirt info, FAQ.
- Registration wizard:
  1) Choose category per participant; add multiple participants.
  2) Participant details (fields shown per flags).
  3) Shirts: optional; select sizes/qty (supports multiple sizes per registration).
  4) Donation: presets 20/50/100 + custom; default 0 if no shirt.
  5) Review + Stripe Checkout.
- Confirmation page: summary, email sent, link to dashboard.

Auth
- Auth0 login/signup; protected routes for dashboard/admin.

Participant dashboard
- My registrations: list with status, payment, QR/pickup codes, shirt orders.
- Announcements feed.
- Download receipt (Stripe) and summary.
- (Later) allow limited edits before cutoff if enabled.

Corporate flow (public)
- Corporate order form: company info, contact info, UEN, shirt sizes/quantities. No payment; shows “We’ll contact you with invoice/payment details.”
- Confirmation page + email to contact + admin notification.

Admin portal
- Events: create/edit event, set current, configure field flags, donation presets, shirt sizes, dates, locations.
- Categories: enable/disable 5K/10K, add more.
- Inventory: per-size quantities (adult/kid).
- Registrations: list, filter, export CSV; view details.
- Corporate orders: list, detail, export, status update.
- Announcements: create/send (email + dashboard).
- Pickup tool: QR scan/manual code; live status; role=volunteer allowed.
- Dashboard: counts (registrations, revenue, shirts remaining, donations).

## Flow highlights
- Registration uses a “quote → create registration → Stripe Checkout → webhook confirms” pattern to ensure atomic inventory handling.
- Pickup tokens per participant; QR + short code; idempotent marking.
- Per-event flags drive form fields; per-event shirt sizes + donation presets are admin-configurable.

If you’re happy with this spec, next I can:
- Draft the Spring Boot controller/service DTOs and endpoint shapes.
- Sketch the registration wizard form shape and the dashboard component tree.
- Add seed data JSON for the current event (5K/10K, donation presets, shirt sizes, price 35).

---

**User**

yes I'm happy

---

**Cursor**

Great. Here’s an implementation-ready plan.

## Backend (Spring Boot) – package & endpoint map
Suggested packages: `api` (controllers), `service`, `domain` (entities), `dto`, `repo`, `config`, `security`.

Auth: Auth0 JWT → Spring Security resource server (RS256). Roles: `ADMIN`, `VOLUNTEER`, `PARTICIPANT`.

Endpoints (REST, v1)
- Events/Categories
  - GET `/api/events/current`
  - GET `/api/events/{id}`
  - POST `/api/events` (ADMIN)
  - PATCH `/api/events/{id}` (ADMIN) – flags, dates, sizes, presets, isCurrent
  - POST `/api/events/{id}/categories` (ADMIN)
  - PATCH `/api/categories/{id}` (ADMIN)
- Registrations
  - POST `/api/registrations/quote`
  - POST `/api/registrations`
  - GET `/api/registrations/me`
  - GET `/api/registrations/{id}` (owner/ADMIN)
- Payments (Stripe)
  - POST `/api/payments/stripe/webhook` (no auth, signed)
- Corporate orders
  - POST `/api/corporate-orders`
  - GET `/api/corporate-orders` (ADMIN)
  - GET `/api/corporate-orders/{id}` (ADMIN)
  - PATCH `/api/corporate-orders/{id}` (ADMIN) – status/notes
- Announcements
  - GET `/api/events/{id}/announcements`
  - POST `/api/events/{id}/announcements` (ADMIN)
- Pickup
  - POST `/api/pickup/scan` (VOLUNTEER/ADMIN) – token or code
- Inventory
  - GET `/api/events/{id}/inventory` (ADMIN)
  - PATCH `/api/events/{id}/inventory` (ADMIN)
- Exports
  - GET `/api/events/{id}/registrations.csv` (ADMIN)
  - GET `/api/events/{id}/corporate-orders.csv` (ADMIN)

Key DTO shapes (concise)
- EventDTO: id, name, year, isCurrent, status, dates (reg/pickup/event), locations, fieldFlags, donationPresets, shirtSizes[], branding.
- CategoryDTO: id, eventId, name, description, basePrice, isActive.
- RegistrationQuoteRequest: eventId, participants[], donationAmount, shirts[].
- ParticipantInput: categoryId, name, email, phone, emergencyContactName/Phone, dob, gender, address, nricLast4, medicalNotes?, tshirtSize?, tshirtType?, tshirtQty? (often 1).
- RegistrationCreateRequest: same as quote + payer info (implicit from JWT) → returns registrationId, stripeSessionId/url, amount.
- PickupScanRequest: tokenOrCode → returns participant summary and marks collected (idempotent).
- CorporateOrderRequest: eventId, companyName, companyAddress, uen, contactName, contactEmail, contactPhone, items[] (size, type, qty).
- AnnouncementRequest: title, body, channelEmail, channelDashboard.

Flow specifics
- Registration: quote → create pending registration + line items → create Stripe Checkout Session → webhook confirms → mark paid, finalize inventory, generate pickup tokens, send email.
- Inventory: reserve on create; finalize on webhook; release on failure/expiry.
- Corporate: no Stripe; store order; email admin/contact; items are shirt sizes/qty only (no runners).

Field flags (per event, JSON)
- Example: `requireAddress`, `requireNricLast4`, `requireEmergencyContact`, `requireDob`, `requireGender`, `allowMedicalNotes`, `allowShirtPurchase`, `allowDonation`, `allowCorporate`, `requireAuth`.

## Frontend (Next.js + MUI) – component/page outline
- Public
  - `/` Landing: hero, CTA, highlights, map, FAQs, sponsors, donation CTA.
  - `/event/[id or current]`: event details, categories, pricing, donation presets, shirt info.
  - `/register`: wizard (multi-participant), steps:
    1) Participants & categories (add many)
    2) Details per participant (respect flags)
    3) Shirts (optional; multiple sizes/qty)
    4) Donation (presets 20/50/100 + custom; default 0)
    5) Review → pay (Stripe)
  - `/corporate`: corporate order form (company/contact/uen + shirt items) → confirmation (no payment).
  - `/confirmation`: summary after Stripe redirect.
- Auth: Auth0 provider wrapper; protected routes for dashboard/admin.
- Participant dashboard
  - `/dashboard`: list registrations; each shows status, payment, QR/pickup code, shirts, donation.
  - Announcements feed.
  - Download receipt link (Stripe).
- Admin
  - `/admin/events`: CRUD, set current, field flags, dates, locations, donation presets, shirt sizes.
  - `/admin/categories`: enable/disable 5K/10K, add more.
  - `/admin/inventory`: adjust per-size quantities (adult/kid).
  - `/admin/registrations`: table + filters + CSV export.
  - `/admin/corporate`: list/detail/export; update status.
  - `/admin/announcements`: create/send.
  - `/admin/pickup`: QR scan/manual code; live status (volunteer role allowed).
  - `/admin/overview`: cards (counts, revenue, donations, shirts remaining).

Suggested client libs
- Data fetching: TanStack Query + fetch/axios.
- Forms: React Hook Form + Zod/Yup for validation.
- QR: `qrcode.react` or similar.

## Seed data (example JSON)
```json
{
  "event": {
    "name": "Terry Fox Run SG",
    "year": 2025,
    "isCurrent": true,
    "status": "open",
    "regOpen": "2025-01-01T00:00:00Z",
    "regClose": "2025-04-30T23:59:59Z",
    "eventStart": "2025-05-10T07:00:00Z",
    "eventEnd": "2025-05-10T11:00:00Z",
    "pickupStart": "2025-05-03T10:00:00Z",
    "pickupEnd": "2025-05-04T18:00:00Z",
    "locationEvent": "TBD, Singapore",
    "locationPickup": "TBD, Singapore",
    "fieldFlags": {
      "requireAddress": true,
      "requireNricLast4": true,
      "requireEmergencyContact": true,
      "requireDob": true,
      "requireGender": true,
      "allowMedicalNotes": true,
      "allowShirtPurchase": true,
      "allowDonation": true,
      "allowCorporate": true
    },
    "donationPresets": [20, 50, 100],
    "shirtPrice": 35,
    "branding": { "primary": "#d90429", "secondary": "#0b0c10", "accent": "#ffffff" }
  },
  "categories": [
    { "name": "5K Fun Run", "description": "5K route", "basePrice": 0, "isActive": true },
    { "name": "10K Fun Run", "description": "10K route", "basePrice": 0, "isActive": true }
  ],
  "shirtSizes": [
    { "type": "adult", "size": "XS", "quantityAvailable": 100 },
    { "type": "adult", "size": "S", "quantityAvailable": 150 },
    { "type": "adult", "size": "M", "quantityAvailable": 200 },
    { "type": "adult", "size": "L", "quantityAvailable": 200 },
    { "type": "adult", "size": "XL", "quantityAvailable": 150 },
    { "type": "adult", "size": "XXL", "quantityAvailable": 80 },
    { "type": "adult", "size": "XXXL", "quantityAvailable": 50 },
    { "type": "kid", "size": "XS", "quantityAvailable": 80 },
    { "type": "kid", "size": "S", "quantityAvailable": 80 },
    { "type": "kid", "size": "M", "quantityAvailable": 80 },
    { "type": "kid", "size": "L", "quantityAvailable": 80 }
  ]
}
```

Next I can:
- Stub the Spring controller interfaces + DTO classes and a simple inventory/reservation service signature.
- Sketch the registration wizard data model (front-end types) and the request payloads for quote/create.
- Add minimal placeholder pages/routes on the Next.js side (Landing, Register, Dashboard, Admin shell) to start wiring.

```json
{
  "event": {
    "name": "Terry Fox Run SG",
    "year": 2025,
    "isCurrent": true,
    "status": "open",
    "regOpen": "2025-01-01T00:00:00Z",
    "regClose": "2025-04-30T23:59:59Z",
    "eventStart": "2025-05-10T07:00:00Z",
    "eventEnd": "2025-05-10T11:00:00Z",
    "pickupStart": "2025-05-03T10:00:00Z",
    "pickupEnd": "2025-05-04T18:00:00Z",
    "locationEvent": "TBD, Singapore",
    "locationPickup": "TBD, Singapore",
    "fieldFlags": {
      "requireAddress": true,
      "requireNricLast4": true,
      "requireEmergencyContact": true,
      "requireDob": true,
      "requireGender": true,
      "allowMedicalNotes": true,
      "allowShirtPurchase": true,
      "allowDonation": true,
      "allowCorporate": true
    },
    "donationPresets": [20, 50, 100],
    "shirtPrice": 35,
    "branding": { "primary": "#d90429", "secondary": "#0b0c10", "accent": "#ffffff" }
  },
  "categories": [
    { "name": "5K Fun Run", "description": "5K route", "basePrice": 0, "isActive": true },
    { "name": "10K Fun Run", "description": "10K route", "basePrice": 0, "isActive": true }
  ],
  "shirtSizes": [
    { "type": "adult", "size": "XS", "quantityAvailable": 100 },
    { "type": "adult", "size": "S", "quantityAvailable": 150 },
    { "type": "adult", "size": "M", "quantityAvailable": 200 },
    { "type": "adult", "size": "L", "quantityAvailable": 200 },
    { "type": "adult", "size": "XL", "quantityAvailable": 150 },
    { "type": "adult", "size": "XXL", "quantityAvailable": 80 },
    { "type": "adult", "size": "XXXL", "quantityAvailable": 50 },
    { "type": "kid", "size": "XS", "quantityAvailable": 80 },
    { "type": "kid", "size": "S", "quantityAvailable": 80 },
    { "type": "kid", "size": "M", "quantityAvailable": 80 },
    { "type": "kid", "size": "L", "quantityAvailable": 80 }
  ]
}
```

---

**User**

lets do it!

---

**Cursor**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.terryfoxrun</groupId>
    <artifactId>backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>terry-fox-run-backend</name>
    <description>Terry Fox Run SG backend</description>
    <packaging>jar</packaging>

    <properties>
        <java.version>21</java.version>
        <spring.boot.version>3.4.1</spring.boot.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-json</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>

```

```java
package com.terryfoxrun.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TerryFoxRunApplication {

    public static void main(String[] args) {
        SpringApplication.run(TerryFoxRunApplication.class, args);
    }
}

```

```java
package com.terryfoxrun.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health").permitAll()
                        .anyRequest().permitAll() // TODO: lock down with Auth0 JWT roles
                )
                .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}

```

```yaml
spring:
  application:
    name: terry-fox-run-backend

# TODO: configure Auth0 issuer/audience, datasource, mail provider, Stripe secrets.

management:
  endpoints:
    web:
      exposure:
        include: health, info
  endpoint:
    health:
      probes:
        enabled: true

```

```java
package com.terryfoxrun.api.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record EventDto(
        Long id,
        String name,
        Integer year,
        boolean isCurrent,
        String status,
        Instant registrationOpen,
        Instant registrationClose,
        Instant eventStart,
        Instant eventEnd,
        Instant pickupStart,
        Instant pickupEnd,
        String locationEvent,
        String locationPickup,
        Map<String, Object> fieldFlags,
        List<Integer> donationPresets,
        Integer shirtPrice,
        List<ShirtSizeDto> shirtSizes,
        BrandingDto branding
) {

    public record ShirtSizeDto(String type, String size, Integer quantityAvailable) {
    }

    public record BrandingDto(String primary, String secondary, String accent) {
    }
}

```

```java
package com.terryfoxrun.api.dto;

public record CategoryDto(
        Long id,
        Long eventId,
        String name,
        String description,
        Integer basePrice,
        boolean isActive
) {
}

```

```java
package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ParticipantInput(
        @NotNull Long categoryId,
        @NotBlank String name,
        @Email String email,
        @NotBlank String phone,
        @NotBlank String emergencyContactName,
        @NotBlank String emergencyContactPhone,
        @NotBlank String dob, // ISO date as string for now
        @NotBlank String gender,
        @NotBlank String address,
        @NotBlank String nricLast4,
        String medicalNotes,
        String tshirtSize,
        String tshirtType,
        Integer tshirtQty
) {
}

```

```java
package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record RegistrationQuoteRequest(
        @NotNull Long eventId,
        @NotNull List<ParticipantInput> participants,
        Integer donationAmount,
        List<ShirtOrderDto> extraShirts
) {
    public record ShirtOrderDto(String size, String type, Integer quantity) {
    }
}

```

```java
package com.terryfoxrun.api.dto;

import java.util.List;

public record RegistrationQuoteResponse(
        Integer subtotal,
        Integer shirtsTotal,
        Integer donationTotal,
        Integer grandTotal,
        List<String> inventoryWarnings
) {
}

```

```java
package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record RegistrationCreateRequest(
        @NotNull Long eventId,
        @NotNull List<ParticipantInput> participants,
        Integer donationAmount,
        List<RegistrationQuoteRequest.ShirtOrderDto> extraShirts,
        String successUrl,
        String cancelUrl
) {
}

```

```java
package com.terryfoxrun.api.dto;

public record RegistrationCreateResponse(
        Long registrationId,
        String stripeSessionId,
        String stripeCheckoutUrl
) {
}

```

```java
package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CorporateOrderRequest(
        @NotNull Long eventId,
        @NotBlank String companyName,
        @NotBlank String companyAddress,
        @NotBlank String uen,
        @NotBlank String contactName,
        @Email String contactEmail,
        @NotBlank String contactPhone,
        @NotNull List<Item> items
) {
    public record Item(
            @NotBlank String size,
            @NotBlank String type,
            @NotNull Integer quantity
    ) {
    }
}

```

```java
package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.NotBlank;

public record AnnouncementRequest(
        @NotBlank String title,
        @NotBlank String body,
        boolean channelEmail,
        boolean channelDashboard
) {
}

```

```java
package com.terryfoxrun.api.dto;

import jakarta.validation.constraints.NotBlank;

public record PickupScanRequest(@NotBlank String tokenOrCode) {
}

```

```java
package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.CategoryDto;
import com.terryfoxrun.api.dto.EventDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @GetMapping("/current")
    public ResponseEntity<EventDto> getCurrentEvent() {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @GetMapping("/{id}/categories")
    public ResponseEntity<List<CategoryDto>> getCategories(@PathVariable Long id) {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @PostMapping
    public ResponseEntity<EventDto> createEvent(@RequestBody EventDto request) {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(@PathVariable Long id, @RequestBody EventDto request) {
        return ResponseEntity.ok().build(); // TODO: implement
    }
}

```

```java
package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.RegistrationCreateRequest;
import com.terryfoxrun.api.dto.RegistrationCreateResponse;
import com.terryfoxrun.api.dto.RegistrationQuoteRequest;
import com.terryfoxrun.api.dto.RegistrationQuoteResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @PostMapping("/quote")
    public ResponseEntity<RegistrationQuoteResponse> quote(@Valid @RequestBody RegistrationQuoteRequest request) {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @PostMapping
    public ResponseEntity<RegistrationCreateResponse> create(@Valid @RequestBody RegistrationCreateRequest request) {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @GetMapping("/me")
    public ResponseEntity<List<Object>> myRegistrations() {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getRegistration(@PathVariable Long id) {
        return ResponseEntity.ok().build(); // TODO: implement
    }
}

```

```java
package com.terryfoxrun.api.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments/stripe")
public class PaymentWebhookController {

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody String payload) {
        return ResponseEntity.ok().build(); // TODO: validate signature and process
    }
}

```

```java
package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.CorporateOrderRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/corporate-orders")
public class CorporateOrderController {

    @PostMapping
    public ResponseEntity<Object> createOrder(@Valid @RequestBody CorporateOrderRequest request) {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @GetMapping
    public ResponseEntity<Object> listOrders() {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Object> updateOrder(@PathVariable Long id, @RequestBody Object request) {
        return ResponseEntity.ok().build(); // TODO: implement
    }
}

```

```java
package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.AnnouncementRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/{eventId}/announcements")
public class AnnouncementController {

    @GetMapping
    public ResponseEntity<Object> list(@PathVariable Long eventId) {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @PostMapping
    public ResponseEntity<Object> create(@PathVariable Long eventId, @Valid @RequestBody AnnouncementRequest request) {
        return ResponseEntity.ok().build(); // TODO: implement
    }
}

```

```java
package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.PickupScanRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pickup")
public class PickupController {

    @PostMapping("/scan")
    public ResponseEntity<Object> scan(@Valid @RequestBody PickupScanRequest request) {
        return ResponseEntity.ok().build(); // TODO: implement
    }
}

```

```java
package com.terryfoxrun.api.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events/{eventId}/inventory")
public class InventoryController {

    @GetMapping
    public ResponseEntity<Object> getInventory(@PathVariable Long eventId) {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @PatchMapping
    public ResponseEntity<Object> updateInventory(@PathVariable Long eventId, @RequestBody Object request) {
        return ResponseEntity.ok().build(); // TODO: implement
    }
}

```

```java
package com.terryfoxrun.api.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events/{eventId}/exports")
public class ExportController {

    @GetMapping("/registrations.csv")
    public ResponseEntity<Object> registrationsCsv(@PathVariable Long eventId) {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @GetMapping("/corporate-orders.csv")
    public ResponseEntity<Object> corporateOrdersCsv(@PathVariable Long eventId) {
        return ResponseEntity.ok().build(); // TODO: implement
    }

    @GetMapping("/finance.csv")
    public ResponseEntity<Object> financeCsv(@PathVariable Long eventId) {
        return ResponseEntity.ok().build(); // TODO: implement
    }
}

```

```typescriptreact
import { Box, Button, Typography } from "@mui/material";

export default function RegisterPage() {
  return (
    <Box display="flex" flexDirection="column" gap={2} p={4}>
      <Typography variant="h4">Register for Terry Fox Run</Typography>
      <Typography color="text.secondary">
        This will be a multi-step wizard: participants, details, shirts,
        donation, review, and payment.
      </Typography>
      <Button variant="contained">Start Registration</Button>
    </Box>
  );
}

```

```typescriptreact
import { Box, Card, CardContent, Typography } from "@mui/material";

export default function DashboardPage() {
  return (
    <Box p={4} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h4">My Dashboard</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">Registrations</Typography>
          <Typography color="text.secondary">
            Your registrations will appear here with QR/pickup codes and
            announcements.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

```

```typescriptreact
import { Box, Card, CardContent, List, ListItem, Typography } from "@mui/material";

export default function AdminPage() {
  return (
    <Box p={4} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h4">Admin Portal</Typography>
      <Typography color="text.secondary">
        Quick links to manage events, categories, inventory, registrations,
        corporate orders, announcements, and pickup.
      </Typography>
      <Card>
        <CardContent>
          <List>
            <ListItem>Events & Categories</ListItem>
            <ListItem>Inventory (Shirt sizes)</ListItem>
            <ListItem>Registrations & Exports</ListItem>
            <ListItem>Corporate Orders</ListItem>
            <ListItem>Announcements</ListItem>
            <ListItem>Pickup / QR Scan</ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

```

```typescriptreact
import { Box, Button, Typography } from "@mui/material";

export default function CorporatePage() {
  return (
    <Box p={4} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h4">Corporate Shirt Orders</Typography>
      <Typography color="text.secondary">
        Submit company details and shirt sizes/quantities. No online payment;
        we will follow up with invoicing.
      </Typography>
      <Button variant="contained">Start Corporate Order</Button>
    </Box>
  );
}

```

```typescriptreact
import { Box, Card, CardContent, Typography } from "@mui/material";

export default function EventPage() {
  return (
    <Box p={4} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h4">Event Details</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">5K & 10K Fun Runs</Typography>
          <Typography color="text.secondary">
            Date, venue, schedule, categories, pricing, and FAQs will be shown
            here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

```

```typescriptreact
import { Box, Typography } from "@mui/material";

export default function PastRunsPage() {
  return (
    <Box p={4} display="flex" flexDirection="column" gap={2}>
      <Typography variant="h4">Past Runs</Typography>
      <Typography color="text.secondary">
        A history of previous events will be listed here with highlights and
        links to results or galleries.
      </Typography>
    </Box>
  );
}

```

Changes made
- Scaffolded Spring Boot backend under `backend/` with Maven, starter dependencies, basic security config, and placeholder `application.yml`.
- Added DTOs for events, categories, registrations (quote/create), participants, corporate orders, announcements, and pickup.
- Stubbed REST controllers for events, registrations, Stripe webhook, corporate orders, announcements, pickup, inventory, and exports.
- Added frontend placeholder pages: `register`, `dashboard`, `admin`, `corporate`, `event`, and `past-runs` with basic MUI scaffolding.
- Restarted Next.js dev server; it’s running on `http://localhost:3001` (3000 was busy).

Notes/next steps
- Backend: wire services/repositories and real responses; lock security to Auth0 JWT roles; add persistence (JPA) and Stripe webhook signature verification.
- Frontend: turn placeholders into real flows (registration wizard, corporate form, admin shell) and hook to the upcoming APIs.
- Configure event field flags, shirt sizes, donation presets, and seed current event data once backend storage is ready.
- Set up Auth0 credentials and env vars for both backend and frontend; add SendGrid/Postmark later.

Want me to proceed with backend service layer + persistence next, or start fleshing out the registration wizard UI?

---

**User**

up to u!

---

**Cursor**

Let’s advance the backend next (best leverage of time). I’ll wire real services + persistence and lock down security, then we can hook the frontend to actual endpoints.

Planned backend steps (proposed):
- Persistence: add Postgres + JPA + Flyway; define entities for Event/Category/Registration/Participant/Inventory/CorporateOrder/Announcement.
- Services: implement quote/create registration with inventory reserve/finalize; Stripe webhook handling; corporate order create/list/update; announcements; pickup scan (idempotent).
- Security: Auth0 JWT resource server; roles ADMIN/VOLUNTEER/PARTICIPANT on routes; keep actuator health open.
- Seed data: initial event with 5K/10K, shirt sizes, donation presets 20/50/100, shirt price 35.

Quick confirmation:
- OK to use Postgres as the DB and Flyway for migrations?
- Stripe keys + Auth0 domain/audience will go into `application.yml` as placeholders; fine to leave unset for now?

If you’re good with that, I’ll proceed to implement the backend service layer and migrations.

---

**User**

OK to use Postgres as the DB and Flyway for migrations?





Yes to postgres, idk what flyway is? but if u recommend it, sure!



Stripe keys + Auth0 domain/audience will go into application.yml as placeholders; fine to leave unset for now? 



Yes

---

**Cursor**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.terryfoxrun</groupId>
    <artifactId>backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>terry-fox-run-backend</name>
    <description>Terry Fox Run SG backend</description>
    <packaging>jar</packaging>

    <properties>
        <java.version>21</java.version>
        <spring.boot.version>3.4.1</spring.boot.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-json</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>


```

```yaml
spring:
  application:
    name: terry-fox-run-backend
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/terryfoxrun}
    username: ${DATABASE_USERNAME:terryfox}
    password: ${DATABASE_PASSWORD:terryfox}
  jpa:
    hibernate:
      ddl-auto: none
    properties:
      hibernate:
        format_sql: true
    open-in-view: false
  flyway:
    enabled: true
    locations: classpath:db/migration

auth0:
  issuer: ${AUTH0_ISSUER:https://your-tenant.auth0.com/}
  audience: ${AUTH0_AUDIENCE:https://api.terryfoxrun.sg/}

stripe:
  secret-key: ${STRIPE_SECRET_KEY:sk_test_placeholder}
  webhook-secret: ${STRIPE_WEBHOOK_SECRET:whsec_placeholder}

# TODO: configure Auth0 issuer/audience, datasource, mail provider, Stripe secrets.

management:
  endpoints:
    web:
      exposure:
        include: health, info
  endpoint:
    health:
      probes:
        enabled: true


```

```java
package com.terryfoxrun.api.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer year;

    @Column(name = "is_current")
    private boolean current;

    private String status;

    private LocalDateTime registrationOpen;
    private LocalDateTime registrationClose;
    private LocalDateTime eventStart;
    private LocalDateTime eventEnd;
    private LocalDateTime pickupStart;
    private LocalDateTime pickupEnd;

    private String locationEvent;
    private String locationPickup;

    @Column(columnDefinition = "jsonb")
    private String fieldFlagsJson;

    @Column(columnDefinition = "jsonb")
    private String donationPresetsJson;

    private Integer shirtPrice;

    @Column(columnDefinition = "jsonb")
    private String brandingJson;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Category> categories;

    public Long getId() {
        return id;
    }

    public boolean isCurrent() {
        return current;
    }

    public void setCurrent(boolean current) {
        this.current = current;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRegistrationOpen() {
        return registrationOpen;
    }

    public void setRegistrationOpen(LocalDateTime registrationOpen) {
        this.registrationOpen = registrationOpen;
    }

    public LocalDateTime getRegistrationClose() {
        return registrationClose;
    }

    public void setRegistrationClose(LocalDateTime registrationClose) {
        this.registrationClose = registrationClose;
    }

    public LocalDateTime getEventStart() {
        return eventStart;
    }

    public void setEventStart(LocalDateTime eventStart) {
        this.eventStart = eventStart;
    }

    public LocalDateTime getEventEnd() {
        return eventEnd;
    }

    public void setEventEnd(LocalDateTime eventEnd) {
        this.eventEnd = eventEnd;
    }

    public LocalDateTime getPickupStart() {
        return pickupStart;
    }

    public void setPickupStart(LocalDateTime pickupStart) {
        this.pickupStart = pickupStart;
    }

    public LocalDateTime getPickupEnd() {
        return pickupEnd;
    }

    public void setPickupEnd(LocalDateTime pickupEnd) {
        this.pickupEnd = pickupEnd;
    }

    public String getLocationEvent() {
        return locationEvent;
    }

    public void setLocationEvent(String locationEvent) {
        this.locationEvent = locationEvent;
    }

    public String getLocationPickup() {
        return locationPickup;
    }

    public void setLocationPickup(String locationPickup) {
        this.locationPickup = locationPickup;
    }

    public String getFieldFlagsJson() {
        return fieldFlagsJson;
    }

    public void setFieldFlagsJson(String fieldFlagsJson) {
        this.fieldFlagsJson = fieldFlagsJson;
    }

    public String getDonationPresetsJson() {
        return donationPresetsJson;
    }

    public void setDonationPresetsJson(String donationPresetsJson) {
        this.donationPresetsJson = donationPresetsJson;
    }

    public Integer getShirtPrice() {
        return shirtPrice;
    }

    public void setShirtPrice(Integer shirtPrice) {
        this.shirtPrice = shirtPrice;
    }

    public String getBrandingJson() {
        return brandingJson;
    }

    public void setBrandingJson(String brandingJson) {
        this.brandingJson = brandingJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Category> getCategories() {
        return categories;
    }

    public void setCategories(List<Category> categories) {
        this.categories = categories;
    }
}

```

```java
package com.terryfoxrun.api.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    private String name;
    private String description;
    private Integer basePrice;
    private boolean active;

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Integer basePrice) {
        this.basePrice = basePrice;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}

```

```java
package com.terryfoxrun.api.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "registrations")
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    private String payerUserId;
    private Integer totalAmount;
    private String paymentStatus;
    private String stripeSessionId;
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RegistrationParticipant> participants;

    @OneToMany(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Donation> donations;

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getPayerUserId() {
        return payerUserId;
    }

    public void setPayerUserId(String payerUserId) {
        this.payerUserId = payerUserId;
    }

    public Integer getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Integer totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getStripeSessionId() {
        return stripeSessionId;
    }

    public void setStripeSessionId(String stripeSessionId) {
        this.stripeSessionId = stripeSessionId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<RegistrationParticipant> getParticipants() {
        return participants;
    }

    public void setParticipants(List<RegistrationParticipant> participants) {
        this.participants = participants;
    }

    public List<Donation> getDonations() {
        return donations;
    }

    public void setDonations(List<Donation> donations) {
        this.donations = donations;
    }
}

```

```java
package com.terryfoxrun.api.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registration_participants")
public class RegistrationParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private Registration registration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    private String name;
    private String email;
    private String phone;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String dob;
    private String gender;
    private String address;
    private String nricLast4;
    private String medicalNotes;
    private String tshirtSize;
    private String tshirtType;
    private Integer tshirtQty;
    private String pickupToken;
    private String pickupCode;
    private String pickupStatus;
    private LocalDateTime pickupTimestamp;

    public Long getId() {
        return id;
    }

    public Registration getRegistration() {
        return registration;
    }

    public void setRegistration(Registration registration) {
        this.registration = registration;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public void setEmergencyContactName(String emergencyContactName) {
        this.emergencyContactName = emergencyContactName;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) {
        this.emergencyContactPhone = emergencyContactPhone;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getNricLast4() {
        return nricLast4;
    }

    public void setNricLast4(String nricLast4) {
        this.nricLast4 = nricLast4;
    }

    public String getMedicalNotes() {
        return medicalNotes;
    }

    public void setMedicalNotes(String medicalNotes) {
        this.medicalNotes = medicalNotes;
    }

    public String getTshirtSize() {
        return tshirtSize;
    }

    public void setTshirtSize(String tshirtSize) {
        this.tshirtSize = tshirtSize;
    }

    public String getTshirtType() {
        return tshirtType;
    }

    public void setTshirtType(String tshirtType) {
        this.tshirtType = tshirtType;
    }

    public Integer getTshirtQty() {
        return tshirtQty;
    }

    public void setTshirtQty(Integer tshirtQty) {
        this.tshirtQty = tshirtQty;
    }

    public String getPickupToken() {
        return pickupToken;
    }

    public void setPickupToken(String pickupToken) {
        this.pickupToken = pickupToken;
    }

    public String getPickupCode() {
        return pickupCode;
    }

    public void setPickupCode(String pickupCode) {
        this.pickupCode = pickupCode;
    }

    public String getPickupStatus() {
        return pickupStatus;
    }

    public void setPickupStatus(String pickupStatus) {
        this.pickupStatus = pickupStatus;
    }

    public LocalDateTime getPickupTimestamp() {
        return pickupTimestamp;
    }

    public void setPickupTimestamp(LocalDateTime pickupTimestamp) {
        this.pickupTimestamp = pickupTimestamp;
    }
}

```

```java
package com.terryfoxrun.api.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "donations")
public class Donation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private Registration registration;

    private Integer amount;

    public Long getId() {
        return id;
    }

    public Registration getRegistration() {
        return registration;
    }

    public void setRegistration(Registration registration) {
        this.registration = registration;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }
}

```

```java
package com.terryfoxrun.api.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "shirt_inventory")
public class ShirtInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    private String size;
    private String type;
    private Integer quantityAvailable;
    private Integer quantityReserved;
    private Integer quantitySold;

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getQuantityAvailable() {
        return quantityAvailable;
    }

    public void setQuantityAvailable(Integer quantityAvailable) {
        this.quantityAvailable = quantityAvailable;
    }

    public Integer getQuantityReserved() {
        return quantityReserved;
    }

    public void setQuantityReserved(Integer quantityReserved) {
        this.quantityReserved = quantityReserved;
    }

    public Integer getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(Integer quantitySold) {
        this.quantitySold = quantitySold;
    }
}

```

```java
package com.terryfoxrun.api.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "corporate_orders")
public class CorporateOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    private String companyName;
    private String companyAddress;
    private String uen;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String status;
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "corporateOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CorporateOrderItem> items;

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyAddress() {
        return companyAddress;
    }

    public void setCompanyAddress(String companyAddress) {
        this.companyAddress = companyAddress;
    }

    public String getUen() {
        return uen;
    }

    public void setUen(String uen) {
        this.uen = uen;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<CorporateOrderItem> getItems() {
        return items;
    }

    public void setItems(List<CorporateOrderItem> items) {
        this.items = items;
    }
}

```

```java
package com.terryfoxrun.api.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "corporate_order_items")
public class CorporateOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "corporate_order_id")
    private CorporateOrder corporateOrder;

    private String size;
    private String type;
    private Integer quantity;

    public Long getId() {
        return id;
    }

    public CorporateOrder getCorporateOrder() {
        return corporateOrder;
    }

    public void setCorporateOrder(CorporateOrder corporateOrder) {
        this.corporateOrder = corporateOrder;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}

```

```java
package com.terryfoxrun.api.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    private String title;
    @Column(columnDefinition = "text")
    private String body;
    private boolean channelEmail;
    private boolean channelDashboard;
    private String createdBy;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public boolean isChannelEmail() {
        return channelEmail;
    }

    public void setChannelEmail(boolean channelEmail) {
        this.channelEmail = channelEmail;
    }

    public boolean isChannelDashboard() {
        return channelDashboard;
    }

    public void setChannelDashboard(boolean channelDashboard) {
        this.channelDashboard = channelDashboard;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

```

```java
package com.terryfoxrun.api.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private Registration registration;

    private Integer amount;
    private String currency;
    private String status;
    private String provider;
    private String providerId;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public Registration getRegistration() {
        return registration;
    }

    public void setRegistration(Registration registration) {
        this.registration = registration;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

```

```java
package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    Optional<Event> findFirstByCurrentTrue();
}

```

```java
package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Category;
import com.terryfoxrun.api.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByEvent(Event event);
}

```

```java
package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByEvent(Event event);
    List<Registration> findByPayerUserId(String payerUserId);
    Optional<Registration> findByStripeSessionId(String stripeSessionId);
}

```

```java
package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.RegistrationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistrationParticipantRepository extends JpaRepository<RegistrationParticipant, Long> {
}

```

```java
package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationRepository extends JpaRepository<Donation, Long> {
}

```

```java
package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.ShirtInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShirtInventoryRepository extends JpaRepository<ShirtInventory, Long> {
    List<ShirtInventory> findByEvent(Event event);
}

```

```java
package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.CorporateOrder;
import com.terryfoxrun.api.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CorporateOrderRepository extends JpaRepository<CorporateOrder, Long> {
    List<CorporateOrder> findByEvent(Event event);
}

```

```java
package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.CorporateOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CorporateOrderItemRepository extends JpaRepository<CorporateOrderItem, Long> {
}

```

```java
package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Announcement;
import com.terryfoxrun.api.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByEventOrderByCreatedAtDesc(Event event);
}

```

```java
package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}

```

```sql
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    year INT,
    is_current BOOLEAN DEFAULT FALSE,
    status TEXT,
    registration_open TIMESTAMPTZ,
    registration_close TIMESTAMPTZ,
    event_start TIMESTAMPTZ,
    event_end TIMESTAMPTZ,
    pickup_start TIMESTAMPTZ,
    pickup_end TIMESTAMPTZ,
    location_event TEXT,
    location_pickup TEXT,
    field_flags_json JSONB,
    donation_presets_json JSONB,
    shirt_price INT,
    branding_json JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    base_price INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE registrations (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    payer_user_id TEXT,
    total_amount INT,
    payment_status TEXT,
    stripe_session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE registration_participants (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT REFERENCES registrations(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id),
    name TEXT,
    email TEXT,
    phone TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    dob TEXT,
    gender TEXT,
    address TEXT,
    nric_last4 TEXT,
    medical_notes TEXT,
    tshirt_size TEXT,
    tshirt_type TEXT,
    tshirt_qty INT,
    pickup_token TEXT,
    pickup_code TEXT,
    pickup_status TEXT,
    pickup_timestamp TIMESTAMPTZ
);

CREATE TABLE donations (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT REFERENCES registrations(id) ON DELETE CASCADE,
    amount INT
);

CREATE TABLE shirt_inventory (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    size TEXT,
    type TEXT,
    quantity_available INT DEFAULT 0,
    quantity_reserved INT DEFAULT 0,
    quantity_sold INT DEFAULT 0
);

CREATE TABLE corporate_orders (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    company_name TEXT,
    company_address TEXT,
    uen TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE corporate_order_items (
    id BIGSERIAL PRIMARY KEY,
    corporate_order_id BIGINT REFERENCES corporate_orders(id) ON DELETE CASCADE,
    size TEXT,
    type TEXT,
    quantity INT
);

CREATE TABLE announcements (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    title TEXT,
    body TEXT,
    channel_email BOOLEAN DEFAULT FALSE,
    channel_dashboard BOOLEAN DEFAULT FALSE,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT REFERENCES registrations(id) ON DELETE CASCADE,
    amount INT,
    currency TEXT,
    status TEXT,
    provider TEXT,
    provider_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_current ON events(is_current);
CREATE INDEX idx_categories_event ON categories(event_id);
CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_payer ON registrations(payer_user_id);
CREATE INDEX idx_participants_registration ON registration_participants(registration_id);
CREATE INDEX idx_shirt_inventory_event ON shirt_inventory(event_id);
CREATE INDEX idx_corporate_orders_event ON corporate_orders(event_id);
CREATE INDEX idx_announcements_event ON announcements(event_id);

```

I set up the backend foundations with Postgres + Flyway, entities, repos, and the initial DB migration. Frontend placeholders were already in place; dev server still running on `http://localhost:3001`.

What I added (backend)
- Maven deps: JPA, Postgres driver, Flyway. (`backend/pom.xml`)
- Config: datasource placeholders, JPA settings, Flyway enabled, Auth0/Stripe placeholders (`backend/src/main/resources/application.yml`).
- DB schema via Flyway: events, categories, registrations, participants, donations, shirt inventory, corporate orders/items, announcements, payments, plus indexes (`backend/src/main/resources/db/migration/V1__init.sql`).
- JPA entities under `com.terryfoxrun.api.domain`: Event, Category, Registration, RegistrationParticipant, Donation, ShirtInventory, CorporateOrder, CorporateOrderItem, Announcement, Payment.
- Repositories for each entity under `repo/`.
- Existing controllers remain stubbed; ready to wire to services.

Notes / next steps
- Create a Postgres database and set `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` env vars before running `mvn spring-boot:run`.
- Implement service logic (quote/create registration with inventory reserve/finalize, Stripe webhook, corporate orders, announcements, pickup scanning) and connect controllers to services.
- Configure Auth0 JWT resource server (issuer/audience) and Stripe keys in `application.yml` or env vars.
- Add initial seed data for the current event (5K/10K, donation presets 20/50/100, shirt price 35, sizes) once persistence is wired.

Want me to implement the service layer next, or set up the Auth0 security configuration first?

---

**User**

up to u!

---

**Cursor**

Let’s implement the backend service layer next (most leverage). I’ll wire the controllers to real services, add inventory checks, and secure the API. Here’s what I’ll do:

Plan
- Auth/Security: Configure Auth0 JWT resource server; lock routes: ADMIN for admin endpoints, VOLUNTEER for pickup, PARTICIPANT for self; keep `/actuator/health` public.
- Services:
  - Event/Category: get current, list, CRUD (admin).
  - Registration: quote + create (with inventory reserve), Stripe Checkout session creation (placeholder if keys unset), webhook to finalize payment, generate pickup tokens.
  - Inventory: per-size get/update (admin).
  - Corporate: create/list/update (no payment).
  - Announcements: list/create.
  - Pickup: scan token/code, mark collected idempotently.
  - Exports: CSV stubs.
- Seed data: migration for initial event with 5K/10K, donation presets 20/50/100, shirt price 35, adult/kid sizes.

If that works for you, I’ll proceed with these steps and update you when the services and security are in place.

---

**User**

sure let's proceed

---

**Cursor**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.terryfoxrun</groupId>
    <artifactId>backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>terry-fox-run-backend</name>
    <description>Terry Fox Run SG backend</description>
    <packaging>jar</packaging>

    <properties>
        <java.version>21</java.version>
        <spring.boot.version>3.4.1</spring.boot.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-json</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>


```

```java
package com.terryfoxrun.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/api/events/current", "/api/events/*", "/api/events/*/categories").permitAll()
                        .requestMatchers("/api/registrations", "/api/registrations/quote").permitAll()
                        .requestMatchers("/api/payments/stripe/webhook").permitAll()
                        .requestMatchers("/api/registrations/me").hasAnyRole("PARTICIPANT", "ADMIN")
                        .requestMatchers("/api/pickup/**").hasAnyRole("VOLUNTEER", "ADMIN")
                        .requestMatchers("/api/events/**", "/api/categories/**", "/api/corporate-orders/**", "/api/announcements/**", "/api/exports/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter delegate = new JwtGrantedAuthoritiesConverter();
        delegate.setAuthoritiesClaimName("permissions"); // Auth0: set to "permissions" or adjust if using "roles"
        delegate.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(delegate);

        // Normalize to upper-case ROLE_*
        SimpleAuthorityMapper mapper = new SimpleAuthorityMapper();
        mapper.setConvertToUpperCase(true);
        converter.setPrincipalClaimName("sub");
        return converter;
    }
}


```

```java
package com.terryfoxrun.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.terryfoxrun.api.domain.Category;
import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.ShirtInventory;
import com.terryfoxrun.api.dto.CategoryDto;
import com.terryfoxrun.api.dto.EventDto;
import com.terryfoxrun.api.repo.CategoryRepository;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.ShirtInventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final ShirtInventoryRepository shirtInventoryRepository;
    private final ObjectMapper objectMapper;

    public EventService(EventRepository eventRepository,
                        CategoryRepository categoryRepository,
                        ShirtInventoryRepository shirtInventoryRepository,
                        ObjectMapper objectMapper) {
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
        this.shirtInventoryRepository = shirtInventoryRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Optional<EventDto> getCurrentEvent() {
        return eventRepository.findFirstByCurrentTrue().map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<EventDto> getEvent(Long id) {
        return eventRepository.findById(id).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategories(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return categoryRepository.findByEvent(event).stream().map(this::toDto).toList();
    }

    @Transactional
    public EventDto createOrUpdate(Long id, EventDto dto) {
        Event event = id == null ? new Event() : eventRepository.findById(id).orElse(new Event());
        applyToEntity(dto, event);
        eventRepository.save(event);

        // Replace shirt inventory for this event
        shirtInventoryRepository.findByEvent(event).forEach(shirtInventoryRepository::delete);
        if (dto.shirtSizes() != null) {
            for (EventDto.ShirtSizeDto s : dto.shirtSizes()) {
                ShirtInventory inv = new ShirtInventory();
                inv.setEvent(event);
                inv.setSize(s.size());
                inv.setType(s.type());
                inv.setQuantityAvailable(s.quantityAvailable());
                inv.setQuantityReserved(0);
                inv.setQuantitySold(0);
                shirtInventoryRepository.save(inv);
            }
        }
        return toDto(event);
    }

    @Transactional
    public CategoryDto createCategory(Long eventId, CategoryDto dto) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        Category cat = new Category();
        cat.setEvent(event);
        cat.setName(dto.name());
        cat.setDescription(dto.description());
        cat.setBasePrice(dto.basePrice());
        cat.setActive(dto.isActive());
        categoryRepository.save(cat);
        return toDto(cat);
    }

    private EventDto toDto(Event event) {
        List<EventDto.ShirtSizeDto> sizes = shirtInventoryRepository.findByEvent(event).stream()
                .map(inv -> new EventDto.ShirtSizeDto(inv.getType(), inv.getSize(), inv.getQuantityAvailable()))
                .toList();
        return new EventDto(
                event.getId(),
                event.getName(),
                event.getYear(),
                event.isCurrent(),
                event.getStatus(),
                toInstant(event.getRegistrationOpen()),
                toInstant(event.getRegistrationClose()),
                toInstant(event.getEventStart()),
                toInstant(event.getEventEnd()),
                toInstant(event.getPickupStart()),
                toInstant(event.getPickupEnd()),
                event.getLocationEvent(),
                event.getLocationPickup(),
                fromJsonMap(event.getFieldFlagsJson()),
                fromJsonList(event.getDonationPresetsJson()),
                event.getShirtPrice(),
                sizes,
                fromJsonBranding(event.getBrandingJson())
        );
    }

    private CategoryDto toDto(Category cat) {
        return new CategoryDto(cat.getId(), cat.getEvent().getId(), cat.getName(), cat.getDescription(), cat.getBasePrice(), cat.isActive());
    }

    private void applyToEntity(EventDto dto, Event event) {
        event.setName(dto.name());
        event.setYear(dto.year());
        event.setCurrent(dto.isCurrent());
        event.setStatus(dto.status());
        event.setRegistrationOpen(fromInstant(dto.registrationOpen()));
        event.setRegistrationClose(fromInstant(dto.registrationClose()));
        event.setEventStart(fromInstant(dto.eventStart()));
        event.setEventEnd(fromInstant(dto.eventEnd()));
        event.setPickupStart(fromInstant(dto.pickupStart()));
        event.setPickupEnd(fromInstant(dto.pickupEnd()));
        event.setLocationEvent(dto.locationEvent());
        event.setLocationPickup(dto.locationPickup());
        event.setFieldFlagsJson(toJson(dto.fieldFlags()));
        event.setDonationPresetsJson(toJson(dto.donationPresets()));
        event.setShirtPrice(dto.shirtPrice());
        event.setBrandingJson(toJson(dto.branding()));
    }

    private java.time.Instant toInstant(java.time.LocalDateTime dt) {
        return dt == null ? null : dt.atZone(java.time.ZoneId.systemDefault()).toInstant();
    }

    private java.time.LocalDateTime fromInstant(java.time.Instant instant) {
        return instant == null ? null : java.time.LocalDateTime.ofInstant(instant, java.time.ZoneId.systemDefault());
    }

    private java.time.Instant toInstant(java.time.LocalDateTime dt, boolean utc) {
        return dt == null ? null : dt.atZone(java.time.ZoneOffset.UTC).toInstant();
    }

    private java.time.Instant toInstant(java.time.LocalDateTime dt) {
        return toInstant(dt, false);
    }

    private java.util.Map<String, Object> fromJsonMap(String json) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructMapType(java.util.Map.class, String.class, Object.class));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private java.util.List<Integer> fromJsonList(String json) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(java.util.List.class, Integer.class));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private EventDto.BrandingDto fromJsonBranding(String json) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, EventDto.BrandingDto.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private String toJson(Object value) {
        if (value == null) return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}

```

```java
package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.*;
import com.terryfoxrun.api.dto.ParticipantInput;
import com.terryfoxrun.api.dto.RegistrationCreateRequest;
import com.terryfoxrun.api.dto.RegistrationCreateResponse;
import com.terryfoxrun.api.dto.RegistrationQuoteRequest;
import com.terryfoxrun.api.dto.RegistrationQuoteResponse;
import com.terryfoxrun.api.repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class RegistrationService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final RegistrationRepository registrationRepository;
    private final RegistrationParticipantRepository participantRepository;
    private final DonationRepository donationRepository;
    private final ShirtInventoryRepository shirtInventoryRepository;

    public RegistrationService(EventRepository eventRepository,
                               CategoryRepository categoryRepository,
                               RegistrationRepository registrationRepository,
                               RegistrationParticipantRepository participantRepository,
                               DonationRepository donationRepository,
                               ShirtInventoryRepository shirtInventoryRepository) {
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
        this.registrationRepository = registrationRepository;
        this.participantRepository = participantRepository;
        this.donationRepository = donationRepository;
        this.shirtInventoryRepository = shirtInventoryRepository;
    }

    @Transactional(readOnly = true)
    public RegistrationQuoteResponse quote(RegistrationQuoteRequest request) {
        Event event = eventRepository.findById(request.eventId()).orElseThrow();
        int shirtPrice = Optional.ofNullable(event.getShirtPrice()).orElse(35);

        int shirtsTotal = 0;
        List<String> warnings = new ArrayList<>();

        Map<String, Integer> requestedBySize = new HashMap<>();
        for (ParticipantInput p : request.participants()) {
            if (p.tshirtSize() != null && p.tshirtQty() != null) {
                String key = p.tshirtType() + ":" + p.tshirtSize();
                requestedBySize.merge(key, p.tshirtQty(), Integer::sum);
                shirtsTotal += p.tshirtQty() * shirtPrice;
            }
        }
        if (request.extraShirts() != null) {
            for (RegistrationQuoteRequest.ShirtOrderDto extra : request.extraShirts()) {
                String key = extra.type() + ":" + extra.size();
                requestedBySize.merge(key, extra.quantity(), Integer::sum);
                shirtsTotal += extra.quantity() * shirtPrice;
            }
        }

        for (Map.Entry<String, Integer> e : requestedBySize.entrySet()) {
            String[] parts = e.getKey().split(":");
            String type = parts[0];
            String size = parts[1];
            int needed = e.getValue();
            Optional<ShirtInventory> invOpt = shirtInventoryRepository.findByEvent(event).stream()
                    .filter(inv -> Objects.equals(inv.getType(), type) && Objects.equals(inv.getSize(), size))
                    .findFirst();
            if (invOpt.isPresent()) {
                ShirtInventory inv = invOpt.get();
                int available = inv.getQuantityAvailable() - inv.getQuantityReserved();
                if (available < needed) {
                    warnings.add(String.format("Size %s (%s) only has %d available", size, type, available));
                }
            } else {
                warnings.add(String.format("Size %s (%s) not available", size, type));
            }
        }

        int donation = Optional.ofNullable(request.donationAmount()).orElse(0);
        int subtotal = shirtsTotal; // categories are currently free (0 base_price)
        int grandTotal = subtotal + donation;

        return new RegistrationQuoteResponse(subtotal, shirtsTotal, donation, grandTotal, warnings);
    }

    @Transactional
    public RegistrationCreateResponse create(String payerUserId, RegistrationCreateRequest request) {
        Event event = eventRepository.findById(request.eventId()).orElseThrow();
        RegistrationQuoteResponse quote = quote(new RegistrationQuoteRequest(
                request.eventId(),
                request.participants(),
                request.donationAmount(),
                request.extraShirts()
        ));
        if (!quote.inventoryWarnings().isEmpty()) {
            throw new IllegalStateException("Inventory not sufficient: " + quote.inventoryWarnings());
        }

        Registration reg = new Registration();
        reg.setEvent(event);
        reg.setPayerUserId(payerUserId);
        reg.setTotalAmount(quote.grandTotal());
        reg.setPaymentStatus("pending");
        reg.setCreatedAt(LocalDateTime.now());
        registrationRepository.save(reg);

        Map<String, Integer> requestedBySize = new HashMap<>();

        for (ParticipantInput p : request.participants()) {
            RegistrationParticipant rp = new RegistrationParticipant();
            rp.setRegistration(reg);
            Category cat = categoryRepository.findById(p.categoryId()).orElseThrow();
            rp.setCategory(cat);
            rp.setName(p.name());
            rp.setEmail(p.email());
            rp.setPhone(p.phone());
            rp.setEmergencyContactName(p.emergencyContactName());
            rp.setEmergencyContactPhone(p.emergencyContactPhone());
            rp.setDob(p.dob());
            rp.setGender(p.gender());
            rp.setAddress(p.address());
            rp.setNricLast4(p.nricLast4());
            rp.setMedicalNotes(p.medicalNotes());
            rp.setTshirtSize(p.tshirtSize());
            rp.setTshirtType(p.tshirtType());
            rp.setTshirtQty(p.tshirtQty());
            rp.setPickupToken(UUID.randomUUID().toString());
            rp.setPickupCode(UUID.randomUUID().toString().substring(0, 8));
            rp.setPickupStatus("pending");
            participantRepository.save(rp);

            if (p.tshirtSize() != null && p.tshirtQty() != null) {
                String key = p.tshirtType() + ":" + p.tshirtSize();
                requestedBySize.merge(key, p.tshirtQty(), Integer::sum);
            }
        }

        if (request.extraShirts() != null) {
            for (RegistrationQuoteRequest.ShirtOrderDto extra : request.extraShirts()) {
                String key = extra.type() + ":" + extra.size();
                requestedBySize.merge(key, extra.quantity(), Integer::sum);
            }
        }

        // Reserve inventory
        for (Map.Entry<String, Integer> e : requestedBySize.entrySet()) {
            String[] parts = e.getKey().split(":");
            String type = parts[0];
            String size = parts[1];
            ShirtInventory inv = shirtInventoryRepository.findByEvent(event).stream()
                    .filter(i -> Objects.equals(i.getType(), type) && Objects.equals(i.getSize(), size))
                    .findFirst()
                    .orElseThrow();
            inv.setQuantityReserved(inv.getQuantityReserved() + e.getValue());
            shirtInventoryRepository.save(inv);
        }

        if (request.donationAmount() != null && request.donationAmount() > 0) {
            Donation donation = new Donation();
            donation.setRegistration(reg);
            donation.setAmount(request.donationAmount());
            donationRepository.save(donation);
        }

        // Placeholder Stripe Checkout Session
        reg.setStripeSessionId("stripe_session_placeholder_" + reg.getId());
        registrationRepository.save(reg);

        String checkoutUrl = request.successUrl() != null ? request.successUrl() : "http://localhost:3000/confirmation";
        return new RegistrationCreateResponse(reg.getId(), reg.getStripeSessionId(), checkoutUrl);
    }

    @Transactional
    public void handleStripeWebhook(String payload, String signature) {
        // TODO: verify signature with Stripe secret, parse event, update registration/payment status.
    }

    @Transactional(readOnly = true)
    public List<Registration> getMyRegistrations(String payerUserId) {
        return registrationRepository.findByPayerUserId(payerUserId);
    }

    @Transactional(readOnly = true)
    public Optional<Registration> getRegistration(Long id) {
        return registrationRepository.findById(id);
    }
}

```

```java
package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.CorporateOrder;
import com.terryfoxrun.api.domain.CorporateOrderItem;
import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.dto.CorporateOrderRequest;
import com.terryfoxrun.api.repo.CorporateOrderItemRepository;
import com.terryfoxrun.api.repo.CorporateOrderRepository;
import com.terryfoxrun.api.repo.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CorporateOrderService {

    private final EventRepository eventRepository;
    private final CorporateOrderRepository corporateOrderRepository;
    private final CorporateOrderItemRepository corporateOrderItemRepository;

    public CorporateOrderService(EventRepository eventRepository,
                                 CorporateOrderRepository corporateOrderRepository,
                                 CorporateOrderItemRepository corporateOrderItemRepository) {
        this.eventRepository = eventRepository;
        this.corporateOrderRepository = corporateOrderRepository;
        this.corporateOrderItemRepository = corporateOrderItemRepository;
    }

    @Transactional
    public CorporateOrder create(CorporateOrderRequest request) {
        Event event = eventRepository.findById(request.eventId()).orElseThrow();
        CorporateOrder order = new CorporateOrder();
        order.setEvent(event);
        order.setCompanyName(request.companyName());
        order.setCompanyAddress(request.companyAddress());
        order.setUen(request.uen());
        order.setContactName(request.contactName());
        order.setContactEmail(request.contactEmail());
        order.setContactPhone(request.contactPhone());
        order.setStatus("pending");
        order.setCreatedAt(LocalDateTime.now());
        corporateOrderRepository.save(order);

        for (CorporateOrderRequest.Item item : request.items()) {
            CorporateOrderItem it = new CorporateOrderItem();
            it.setCorporateOrder(order);
            it.setSize(item.size());
            it.setType(item.type());
            it.setQuantity(item.quantity());
            corporateOrderItemRepository.save(it);
        }
        return order;
    }

    @Transactional(readOnly = true)
    public List<CorporateOrder> list(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return corporateOrderRepository.findByEvent(event);
    }

    @Transactional(readOnly = true)
    public CorporateOrder get(Long id) {
        return corporateOrderRepository.findById(id).orElseThrow();
    }

    @Transactional
    public CorporateOrder updateStatus(Long id, String status) {
        CorporateOrder order = corporateOrderRepository.findById(id).orElseThrow();
        order.setStatus(status);
        return corporateOrderRepository.save(order);
    }
}

```

```java
package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.Announcement;
import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.dto.AnnouncementRequest;
import com.terryfoxrun.api.repo.AnnouncementRepository;
import com.terryfoxrun.api.repo.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AnnouncementService {

    private final EventRepository eventRepository;
    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(EventRepository eventRepository, AnnouncementRepository announcementRepository) {
        this.eventRepository = eventRepository;
        this.announcementRepository = announcementRepository;
    }

    @Transactional(readOnly = true)
    public List<Announcement> list(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return announcementRepository.findByEventOrderByCreatedAtDesc(event);
    }

    @Transactional
    public Announcement create(Long eventId, String createdBy, AnnouncementRequest request) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        Announcement ann = new Announcement();
        ann.setEvent(event);
        ann.setTitle(request.title());
        ann.setBody(request.body());
        ann.setChannelEmail(request.channelEmail());
        ann.setChannelDashboard(request.channelDashboard());
        ann.setCreatedBy(createdBy);
        ann.setCreatedAt(LocalDateTime.now());
        return announcementRepository.save(ann);
    }
}

```

```java
package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.ShirtInventory;
import com.terryfoxrun.api.dto.EventDto;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.ShirtInventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {

    private final EventRepository eventRepository;
    private final ShirtInventoryRepository shirtInventoryRepository;

    public InventoryService(EventRepository eventRepository, ShirtInventoryRepository shirtInventoryRepository) {
        this.eventRepository = eventRepository;
        this.shirtInventoryRepository = shirtInventoryRepository;
    }

    @Transactional(readOnly = true)
    public List<EventDto.ShirtSizeDto> getInventory(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return shirtInventoryRepository.findByEvent(event).stream()
                .map(inv -> new EventDto.ShirtSizeDto(inv.getType(), inv.getSize(), inv.getQuantityAvailable()))
                .toList();
    }

    @Transactional
    public void updateInventory(Long eventId, List<EventDto.ShirtSizeDto> items) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        shirtInventoryRepository.findByEvent(event).forEach(shirtInventoryRepository::delete);
        for (EventDto.ShirtSizeDto dto : items) {
            ShirtInventory inv = new ShirtInventory();
            inv.setEvent(event);
            inv.setType(dto.type());
            inv.setSize(dto.size());
            inv.setQuantityAvailable(dto.quantityAvailable());
            inv.setQuantityReserved(0);
            inv.setQuantitySold(0);
            shirtInventoryRepository.save(inv);
        }
    }
}

```

```java
package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.RegistrationParticipant;
import com.terryfoxrun.api.repo.RegistrationParticipantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PickupService {

    private final RegistrationParticipantRepository participantRepository;

    public PickupService(RegistrationParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    @Transactional
    public Optional<RegistrationParticipant> markCollected(String tokenOrCode) {
        Optional<RegistrationParticipant> participant = participantRepository.findByPickupToken(tokenOrCode);
        if (participant.isEmpty()) {
            participant = participantRepository.findByPickupCode(tokenOrCode);
        }
        participant.ifPresent(p -> {
            p.setPickupStatus("collected");
            p.setPickupTimestamp(LocalDateTime.now());
            participantRepository.save(p);
        });
        return participant;
    }
}

```

```java
package com.terryfoxrun.api.service;

import com.terryfoxrun.api.domain.Event;
import com.terryfoxrun.api.domain.Registration;
import com.terryfoxrun.api.repo.EventRepository;
import com.terryfoxrun.api.repo.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class ExportService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;

    public ExportService(EventRepository eventRepository, RegistrationRepository registrationRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
    }

    @Transactional(readOnly = true)
    public byte[] registrationsCsv(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        List<Registration> regs = registrationRepository.findByEvent(event);
        StringBuilder sb = new StringBuilder("registration_id,payer_user_id,total_amount,payment_status,created_at\n");
        regs.forEach(r -> sb.append(r.getId()).append(",")
                .append(r.getPayerUserId()).append(",")
                .append(r.getTotalAmount()).append(",")
                .append(r.getPaymentStatus()).append(",")
                .append(r.getCreatedAt()).append("\n"));
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    // Placeholders for corporate and finance exports
    public byte[] corporateCsv(Long eventId) {
        return "not_implemented\n".getBytes(StandardCharsets.UTF_8);
    }

    public byte[] financeCsv(Long eventId) {
        return "not_implemented\n".getBytes(StandardCharsets.UTF_8);
    }
}

```

```java
package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.CategoryDto;
import com.terryfoxrun.api.dto.EventDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final com.terryfoxrun.api.service.EventService eventService;

    public EventController(com.terryfoxrun.api.service.EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("/current")
    public ResponseEntity<EventDto> getCurrentEvent() {
        return eventService.getCurrentEvent()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEvent(@PathVariable Long id) {
        return eventService.getEvent(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/categories")
    public ResponseEntity<List<CategoryDto>> getCategories(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getCategories(id));
    }

    @PostMapping
    public ResponseEntity<EventDto> createEvent(@RequestBody EventDto request) {
        return ResponseEntity.ok(eventService.createOrUpdate(null, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(@PathVariable Long id, @RequestBody EventDto request) {
        return ResponseEntity.ok(eventService.createOrUpdate(id, request));
    }
}


```

```java
package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.RegistrationCreateRequest;
import com.terryfoxrun.api.dto.RegistrationCreateResponse;
import com.terryfoxrun.api.dto.RegistrationQuoteRequest;
import com.terryfoxrun.api.dto.RegistrationQuoteResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final com.terryfoxrun.api.service.RegistrationService registrationService;

    public RegistrationController(com.terryfoxrun.api.service.RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/quote")
    public ResponseEntity<RegistrationQuoteResponse> quote(@Valid @RequestBody RegistrationQuoteRequest request) {
        return ResponseEntity.ok(registrationService.quote(request));
    }

    @PostMapping
    public ResponseEntity<RegistrationCreateResponse> create(@Valid @RequestBody RegistrationCreateRequest request,
                                                             @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String payer = userId != null ? userId : "anonymous";
        return ResponseEntity.ok(registrationService.create(payer, request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Object>> myRegistrations(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        String payer = userId != null ? userId : "anonymous";
        return ResponseEntity.ok(registrationService.getMyRegistrations(payer).stream().map(r -> r.getId()).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getRegistration(@PathVariable Long id) {
        return registrationService.getRegistration(id)
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}


```

```java
package com.terryfoxrun.api.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments/stripe")
public class PaymentWebhookController {

    private final com.terryfoxrun.api.service.RegistrationService registrationService;

    public PaymentWebhookController(com.terryfoxrun.api.service.RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody String payload,
                                              @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        registrationService.handleStripeWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }
}


```

```java
package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.CorporateOrderRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/corporate-orders")
public class CorporateOrderController {

    private final com.terryfoxrun.api.service.CorporateOrderService corporateOrderService;

    public CorporateOrderController(com.terryfoxrun.api.service.CorporateOrderService corporateOrderService) {
        this.corporateOrderService = corporateOrderService;
    }

    @PostMapping
    public ResponseEntity<Object> createOrder(@Valid @RequestBody CorporateOrderRequest request) {
        return ResponseEntity.ok(corporateOrderService.create(request).getId());
    }

    @GetMapping
    public ResponseEntity<Object> listOrders(@RequestParam Long eventId) {
        return ResponseEntity.ok(corporateOrderService.list(eventId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(corporateOrderService.get(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Object> updateOrder(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(corporateOrderService.updateStatus(id, status));
    }
}


```

```java
package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.AnnouncementRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/{eventId}/announcements")
public class AnnouncementController {

    private final com.terryfoxrun.api.service.AnnouncementService announcementService;

    public AnnouncementController(com.terryfoxrun.api.service.AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping
    public ResponseEntity<Object> list(@PathVariable Long eventId) {
        return ResponseEntity.ok(announcementService.list(eventId));
    }

    @PostMapping
    public ResponseEntity<Object> create(@PathVariable Long eventId,
                                         @Valid @RequestBody AnnouncementRequest request,
                                         @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String creator = userId != null ? userId : "admin";
        return ResponseEntity.ok(announcementService.create(eventId, creator, request));
    }
}


```

```java
package com.terryfoxrun.api.api;

import com.terryfoxrun.api.dto.PickupScanRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pickup")
public class PickupController {

    private final com.terryfoxrun.api.service.PickupService pickupService;

    public PickupController(com.terryfoxrun.api.service.PickupService pickupService) {
        this.pickupService = pickupService;
    }

    @PostMapping("/scan")
    public ResponseEntity<Object> scan(@Valid @RequestBody PickupScanRequest request) {
        return pickupService.markCollected(request.tokenOrCode())
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}


```

```java
package com.terryfoxrun.api.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events/{eventId}/inventory")
public class InventoryController {

    private final com.terryfoxrun.api.service.InventoryService inventoryService;

    public InventoryController(com.terryfoxrun.api.service.InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<Object> getInventory(@PathVariable Long eventId) {
        return ResponseEntity.ok(inventoryService.getInventory(eventId));
    }

    @PatchMapping
    public ResponseEntity<Object> updateInventory(@PathVariable Long eventId, @RequestBody java.util.List<com.terryfoxrun.api.dto.EventDto.ShirtSizeDto> items) {
        inventoryService.updateInventory(eventId, items);
        return ResponseEntity.ok().build();
    }
}


```

```java
package com.terryfoxrun.api.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events/{eventId}/exports")
public class ExportController {

    private final com.terryfoxrun.api.service.ExportService exportService;

    public ExportController(com.terryfoxrun.api.service.ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/registrations.csv")
    public ResponseEntity<byte[]> registrationsCsv(@PathVariable Long eventId) {
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .body(exportService.registrationsCsv(eventId));
    }

    @GetMapping("/corporate-orders.csv")
    public ResponseEntity<byte[]> corporateOrdersCsv(@PathVariable Long eventId) {
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .body(exportService.corporateCsv(eventId));
    }

    @GetMapping("/finance.csv")
    public ResponseEntity<byte[]> financeCsv(@PathVariable Long eventId) {
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .body(exportService.financeCsv(eventId));
    }
}


```

```java
package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.RegistrationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegistrationParticipantRepository extends JpaRepository<RegistrationParticipant, Long> {
    Optional<RegistrationParticipant> findByPickupToken(String pickupToken);
    Optional<RegistrationParticipant> findByPickupCode(String pickupCode);
}


```

```java
package com.terryfoxrun.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/api/events/current", "/api/events/*", "/api/events/*/categories").permitAll()
                        .requestMatchers("/api/registrations", "/api/registrations/quote").permitAll()
                        .requestMatchers("/api/payments/stripe/webhook").permitAll()
                        .requestMatchers("/api/registrations/me").hasAnyRole("PARTICIPANT", "ADMIN")
                        .requestMatchers("/api/pickup/**").hasAnyRole("VOLUNTEER", "ADMIN")
                        .requestMatchers("/api/events/**", "/api/categories/**", "/api/corporate-orders/**", "/api/announcements/**", "/api/exports/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter delegate = new JwtGrantedAuthoritiesConverter();
        delegate.setAuthoritiesClaimName("permissions"); // Auth0: set to "permissions" or adjust if using "roles"
        delegate.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(delegate);
        converter.setPrincipalClaimName("sub");
        return converter;
    }
}


```

```sql
INSERT INTO events (name, year, is_current, status, registration_open, registration_close, event_start, event_end, pickup_start, pickup_end, location_event, location_pickup, field_flags_json, donation_presets_json, shirt_price, branding_json)
VALUES (
    'Terry Fox Run SG',
    2025,
    TRUE,
    'open',
    now(),
    now() + interval '120 days',
    now() + interval '140 days',
    now() + interval '140 days' + interval '4 hours',
    now() + interval '133 days',
    now() + interval '134 days',
    'TBD, Singapore',
    'TBD, Singapore',
    '{"requireAddress": true, "requireNricLast4": true, "requireEmergencyContact": true, "requireDob": true, "requireGender": true, "allowMedicalNotes": true, "allowShirtPurchase": true, "allowDonation": true, "allowCorporate": true}',
    '[20,50,100]',
    35,
    '{"primary":"#d90429","secondary":"#0b0c10","accent":"#ffffff"}'
);

-- Seed categories
INSERT INTO categories (event_id, name, description, base_price, active)
SELECT id, '5K Fun Run', '5K route', 0, TRUE FROM events WHERE is_current = TRUE;
INSERT INTO categories (event_id, name, description, base_price, active)
SELECT id, '10K Fun Run', '10K route', 0, TRUE FROM events WHERE is_current = TRUE;

-- Seed shirt sizes with quantities (adjust later in admin)
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'XS', 'adult', 100, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'S', 'adult', 150, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'M', 'adult', 200, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'L', 'adult', 200, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'XL', 'adult', 150, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'XXL', 'adult', 80, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'XXXL', 'adult', 50, 0, 0 FROM events WHERE is_current = TRUE;

INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'XS', 'kid', 80, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'S', 'kid', 80, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'M', 'kid', 80, 0, 0 FROM events WHERE is_current = TRUE;
INSERT INTO shirt_inventory (event_id, size, type, quantity_available, quantity_reserved, quantity_sold)
SELECT id, 'L', 'kid', 80, 0, 0 FROM events WHERE is_current = TRUE;

```

I’ve wired the backend with Postgres/Flyway, entities, repositories, services, security, and initial seeds. You can now run the backend (after setting DB creds) and the endpoints will return real data instead of placeholders.

What changed (backend)
- Maven: added JPA, Postgres, Flyway, OAuth2 resource server (`pom.xml`).
- Config: datasource placeholders, Flyway enabled, Auth0/Stripe placeholders (`application.yml`).
- DB migrations: `V1__init.sql` creates all tables; `V2__seed_event.sql` seeds the current event (2025), 5K/10K categories, donation presets 20/50/100, shirt price 35, adult/kid shirt sizes with starter inventory.
- Entities & repositories: Event, Category, Registration, Participant, Donation, ShirtInventory, CorporateOrder (+ items), Announcement, Payment; repos for each.
- Services:
  - `EventService`: get current/by id, categories, create/update event, manage shirt inventory.
  - `RegistrationService`: quote (shirt/donation totals + inventory warnings), create registration (reserves inventory, creates participants, donations, pickup tokens, placeholder Stripe session), stub webhook handler, fetch mine/by id.
  - `CorporateOrderService`: create/list/get/update-status (no payment).
  - `AnnouncementService`: list/create.
  - `InventoryService`: get/update shirt inventory per event.
  - `PickupService`: scan token/code and mark collected (idempotent).
  - `ExportService`: basic registrations CSV (others placeholder).
- Controllers now call services:
  - Events, Registrations, Stripe webhook, Corporate orders, Announcements, Pickup, Inventory, Exports.
- Security: OAuth2 resource server (Auth0 JWT); routes gated: health public, events GET public, registration create/quote public, webhook public; `/registrations/me` requires PARTICIPANT/ADMIN; pickup requires VOLUNTEER/ADMIN; admin routes require ADMIN. (JWT roles via `permissions` claim with `ROLE_` prefix—adjust if your Auth0 setup differs.)

How to run backend
1) Create Postgres DB and set env:
   - `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
2) Optional env placeholders:
   - `AUTH0_ISSUER`, `AUTH0_AUDIENCE`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
3) Run: `mvn spring-boot:run` from `backend/`. Flyway will apply migrations and seed the current event.

Frontend
- Dev server is running on `http://localhost:3001` (3000 was busy). New placeholder pages are in place: landing (root), `/register`, `/dashboard`, `/admin`, `/corporate`, `/event`, `/past-runs`.

Next recommended steps
- Wire real Stripe Checkout session creation and webhook verification in `RegistrationService`.
- Configure Auth0 JWT validation (issuer/audience) and test a token flow.
- Flesh out frontend registration wizard to call `/api/registrations/quote` and `/api/registrations`.
- Build admin forms for events/categories/inventory and announcements.
- Add email sending (SendGrid/Postmark) for confirmations and announcements.

If you want, I can next implement Stripe session creation + webhook handling, and tighten the Auth0 role mapping.

---

**User**

lets do it

---

**Cursor**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.terryfoxrun</groupId>
    <artifactId>backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>terry-fox-run-backend</name>
    <description>Terry Fox Run SG backend</description>
    <packaging>jar</packaging>

    <properties>
        <java.version>21</java.version>
        <spring.boot.version>3.4.1</spring.boot.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>
        <dependency>
            <groupId>com.stripe</groupId>
            <artifactId>stripe-java</artifactId>
            <version>24.10.0</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-json</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>


```

```java
package com.terryfoxrun.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "stripe")
public class StripeProperties {
    /**
     * Secret key for server-side Stripe operations.
     */
    private String secretKey;
    /**
     * Webhook signing secret for verifying incoming events.
     */
    private String webhookSecret;

    public String getSecretKey() {
        return secretKey;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }

    public void setWebhookSecret(String webhookSecret) {
        this.webhookSecret = webhookSecret;
    }
}

```

```yaml
spring:
  application:
    name: terry-fox-run-backend
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/terryfoxrun}
    username: ${DATABASE_USERNAME:terryfox}
    password: ${DATABASE_PASSWORD:terryfox}
  jpa:
    hibernate:
      ddl-auto: none
    properties:
      hibernate:
        format_sql: true
    open-in-view: false
  flyway:
    enabled: true
    locations: classpath:db/migration

auth0:
  issuer: ${AUTH0_ISSUER:https://your-tenant.auth0.com/}
  audience: ${AUTH0_AUDIENCE:https://api.terryfoxrun.sg/}

stripe:
  secret-key: ${STRIPE_SECRET_KEY:sk_test_placeholder}
  webhook-secret: ${STRIPE_WEBHOOK_SECRET:whsec_placeholder}

# TODO: configure Auth0 issuer/audience, datasource, mail provider, Stripe secrets.

management:
  endpoints:
    web:
      exposure:
        include: health, info
  endpoint:
    health:
      probes:
        enabled: true


```

```java
package com.terryfoxrun.api.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "registration_shirts")
public class RegistrationShirt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private Registration registration;

    private String size;
    private String type;
    private Integer quantity;
    private String source; // e.g., "extra"

    public Long getId() {
        return id;
    }

    public Registration getRegistration() {
        return registration;
    }

    public void setRegistration(Registration registration) {
        this.registration = registration;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}

```

```java
package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.Registration;
import com.terryfoxrun.api.domain.RegistrationShirt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationShirtRepository extends JpaRepository<RegistrationShirt, Long> {
    List<RegistrationShirt> findByRegistration(Registration registration);
}

```

```sql
CREATE TABLE registration_shirts (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT REFERENCES registrations(id) ON DELETE CASCADE,
    size TEXT,
    type TEXT,
    quantity INT,
    source TEXT
);

```

```java
package com.terryfoxrun.api.service;

import com.terryfoxrun.api.config.StripeProperties;
import com.terryfoxrun.api.domain.*;
import com.terryfoxrun.api.dto.ParticipantInput;
import com.terryfoxrun.api.dto.RegistrationCreateRequest;
import com.terryfoxrun.api.dto.RegistrationCreateResponse;
import com.terryfoxrun.api.dto.RegistrationQuoteRequest;
import com.terryfoxrun.api.dto.RegistrationQuoteResponse;
import com.terryfoxrun.api.repo.*;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RegistrationService {

    private static final Logger log = LoggerFactory.getLogger(RegistrationService.class);

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final RegistrationRepository registrationRepository;
    private final RegistrationParticipantRepository participantRepository;
    private final DonationRepository donationRepository;
    private final ShirtInventoryRepository shirtInventoryRepository;
    private final RegistrationShirtRepository registrationShirtRepository;
    private final PaymentRepository paymentRepository;
    private final StripeProperties stripeProperties;

    public RegistrationService(EventRepository eventRepository,
                               CategoryRepository categoryRepository,
                               RegistrationRepository registrationRepository,
                               RegistrationParticipantRepository participantRepository,
                               DonationRepository donationRepository,
                               ShirtInventoryRepository shirtInventoryRepository,
                               RegistrationShirtRepository registrationShirtRepository,
                               PaymentRepository paymentRepository,
                               StripeProperties stripeProperties) {
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
        this.registrationRepository = registrationRepository;
        this.participantRepository = participantRepository;
        this.donationRepository = donationRepository;
        this.shirtInventoryRepository = shirtInventoryRepository;
        this.registrationShirtRepository = registrationShirtRepository;
        this.paymentRepository = paymentRepository;
        this.stripeProperties = stripeProperties;

        if (stripeProperties.getSecretKey() != null && !stripeProperties.getSecretKey().isBlank()) {
            Stripe.apiKey = stripeProperties.getSecretKey();
        }
    }

    @Transactional(readOnly = true)
    public RegistrationQuoteResponse quote(RegistrationQuoteRequest request) {
        Event event = eventRepository.findById(request.eventId()).orElseThrow();
        int shirtPrice = Optional.ofNullable(event.getShirtPrice()).orElse(35);

        int shirtsTotal = 0;
        List<String> warnings = new ArrayList<>();

        Map<String, Integer> requestedBySize = new HashMap<>();
        for (ParticipantInput p : request.participants()) {
            if (p.tshirtSize() != null && p.tshirtQty() != null) {
                String key = p.tshirtType() + ":" + p.tshirtSize();
                requestedBySize.merge(key, p.tshirtQty(), Integer::sum);
                shirtsTotal += p.tshirtQty() * shirtPrice;
            }
        }
        if (request.extraShirts() != null) {
            for (RegistrationQuoteRequest.ShirtOrderDto extra : request.extraShirts()) {
                String key = extra.type() + ":" + extra.size();
                requestedBySize.merge(key, extra.quantity(), Integer::sum);
                shirtsTotal += extra.quantity() * shirtPrice;
            }
        }

        for (Map.Entry<String, Integer> e : requestedBySize.entrySet()) {
            String[] parts = e.getKey().split(":");
            String type = parts[0];
            String size = parts[1];
            int needed = e.getValue();
            Optional<ShirtInventory> invOpt = shirtInventoryRepository.findByEvent(event).stream()
                    .filter(inv -> Objects.equals(inv.getType(), type) && Objects.equals(inv.getSize(), size))
                    .findFirst();
            if (invOpt.isPresent()) {
                ShirtInventory inv = invOpt.get();
                int available = inv.getQuantityAvailable() - inv.getQuantityReserved();
                if (available < needed) {
                    warnings.add(String.format("Size %s (%s) only has %d available", size, type, available));
                }
            } else {
                warnings.add(String.format("Size %s (%s) not available", size, type));
            }
        }

        int donation = Optional.ofNullable(request.donationAmount()).orElse(0);
        int subtotal = shirtsTotal; // categories are currently free (0 base_price)
        int grandTotal = subtotal + donation;

        return new RegistrationQuoteResponse(subtotal, shirtsTotal, donation, grandTotal, warnings);
    }

    @Transactional
    public RegistrationCreateResponse create(String payerUserId, RegistrationCreateRequest request) {
        Event event = eventRepository.findById(request.eventId()).orElseThrow();
        RegistrationQuoteResponse quote = quote(new RegistrationQuoteRequest(
                request.eventId(),
                request.participants(),
                request.donationAmount(),
                request.extraShirts()
        ));
        if (!quote.inventoryWarnings().isEmpty()) {
            throw new IllegalStateException("Inventory not sufficient: " + quote.inventoryWarnings());
        }

        Registration reg = new Registration();
        reg.setEvent(event);
        reg.setPayerUserId(payerUserId);
        reg.setTotalAmount(quote.grandTotal());
        reg.setPaymentStatus("pending");
        reg.setCreatedAt(LocalDateTime.now());
        registrationRepository.save(reg);

        Map<String, Integer> requestedBySize = new HashMap<>();

        for (ParticipantInput p : request.participants()) {
            RegistrationParticipant rp = new RegistrationParticipant();
            rp.setRegistration(reg);
            Category cat = categoryRepository.findById(p.categoryId()).orElseThrow();
            rp.setCategory(cat);
            rp.setName(p.name());
            rp.setEmail(p.email());
            rp.setPhone(p.phone());
            rp.setEmergencyContactName(p.emergencyContactName());
            rp.setEmergencyContactPhone(p.emergencyContactPhone());
            rp.setDob(p.dob());
            rp.setGender(p.gender());
            rp.setAddress(p.address());
            rp.setNricLast4(p.nricLast4());
            rp.setMedicalNotes(p.medicalNotes());
            rp.setTshirtSize(p.tshirtSize());
            rp.setTshirtType(p.tshirtType());
            rp.setTshirtQty(p.tshirtQty());
            rp.setPickupToken(UUID.randomUUID().toString());
            rp.setPickupCode(UUID.randomUUID().toString().substring(0, 8));
            rp.setPickupStatus("pending");
            participantRepository.save(rp);

            if (p.tshirtSize() != null && p.tshirtQty() != null) {
                String key = p.tshirtType() + ":" + p.tshirtSize();
                requestedBySize.merge(key, p.tshirtQty(), Integer::sum);
            }
        }

        if (request.extraShirts() != null) {
            for (RegistrationQuoteRequest.ShirtOrderDto extra : request.extraShirts()) {
                String key = extra.type() + ":" + extra.size();
                requestedBySize.merge(key, extra.quantity(), Integer::sum);
                RegistrationShirt rs = new RegistrationShirt();
                rs.setRegistration(reg);
                rs.setSize(extra.size());
                rs.setType(extra.type());
                rs.setQuantity(extra.quantity());
                rs.setSource("extra");
                registrationShirtRepository.save(rs);
            }
        }

        // Reserve inventory
        reserveInventory(event, requestedBySize);

        if (request.donationAmount() != null && request.donationAmount() > 0) {
            Donation donation = new Donation();
            donation.setRegistration(reg);
            donation.setAmount(request.donationAmount());
            donationRepository.save(donation);
        }

        String sessionId;
        String checkoutUrl;
        if (isStripeConfigured()) {
            Session session = createStripeSession(reg, event, requestedBySize, quote, request);
            sessionId = session.getId();
            checkoutUrl = session.getUrl();
        } else {
            sessionId = "stripe_session_placeholder_" + reg.getId();
            checkoutUrl = request.successUrl() != null ? request.successUrl() : "http://localhost:3000/confirmation";
        }

        reg.setStripeSessionId(sessionId);
        registrationRepository.save(reg);

        return new RegistrationCreateResponse(reg.getId(), reg.getStripeSessionId(), checkoutUrl);
    }

    @Transactional
    public void handleStripeWebhook(String payload, String signature) {
        if (!isStripeConfigured()) {
            log.warn("Stripe webhook received but Stripe is not configured; ignoring.");
            return;
        }
        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, stripeProperties.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe signature: {}", e.getMessage());
            return;
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session == null) return;
            String sessionId = session.getId();
            registrationRepository.findByStripeSessionId(sessionId).ifPresent(reg -> finalizePayment(reg, "paid", session.getPaymentIntent()));
        } else if ("checkout.session.expired".equals(event.getType()) || "checkout.session.async_payment_failed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session == null) return;
            String sessionId = session.getId();
            registrationRepository.findByStripeSessionId(sessionId).ifPresent(reg -> finalizePayment(reg, "failed", session.getPaymentIntent()));
        }
    }

    @Transactional(readOnly = true)
    public List<Registration> getMyRegistrations(String payerUserId) {
        return registrationRepository.findByPayerUserId(payerUserId);
    }

    @Transactional(readOnly = true)
    public Optional<Registration> getRegistration(Long id) {
        return registrationRepository.findById(id);
    }

    private boolean isStripeConfigured() {
        return stripeProperties.getSecretKey() != null
                && !stripeProperties.getSecretKey().startsWith("sk_test_placeholder")
                && !stripeProperties.getSecretKey().isBlank();
    }

    private Session createStripeSession(Registration reg,
                                        Event event,
                                        Map<String, Integer> requestedBySize,
                                        RegistrationQuoteResponse quote,
                                        RegistrationCreateRequest request) {
        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();
        int shirtPrice = Optional.ofNullable(event.getShirtPrice()).orElse(35);
        for (Map.Entry<String, Integer> e : requestedBySize.entrySet()) {
            String[] parts = e.getKey().split(":");
            String type = parts[0];
            String size = parts[1];
            lineItems.add(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(e.getValue().longValue())
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("sgd")
                                    .setUnitAmount(Long.valueOf(shirtPrice * 100L)) // cents
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("T-Shirt (" + type + " " + size + ")")
                                            .build())
                                    .build())
                            .build()
            );
        }
        if (request.donationAmount() != null && request.donationAmount() > 0) {
            lineItems.add(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("sgd")
                                    .setUnitAmount(Long.valueOf(request.donationAmount() * 100L))
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Donation")
                                            .build())
                                    .build())
                            .build()
            );
        }

        String successUrl = request.successUrl() != null ? request.successUrl() : "http://localhost:3000/confirmation?status=success";
        String cancelUrl = request.cancelUrl() != null ? request.cancelUrl() : "http://localhost:3000/confirmation?status=cancel";

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addAllLineItem(lineItems)
                .putMetadata("registrationId", reg.getId().toString())
                .build();
        try {
            return Session.create(params);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create Stripe session: " + e.getMessage(), e);
        }
    }

    private void reserveInventory(Event event, Map<String, Integer> requestedBySize) {
        for (Map.Entry<String, Integer> e : requestedBySize.entrySet()) {
            String[] parts = e.getKey().split(":");
            String type = parts[0];
            String size = parts[1];
            ShirtInventory inv = shirtInventoryRepository.findByEvent(event).stream()
                    .filter(i -> Objects.equals(i.getType(), type) && Objects.equals(i.getSize(), size))
                    .findFirst()
                    .orElseThrow();
            inv.setQuantityReserved(inv.getQuantityReserved() + e.getValue());
            shirtInventoryRepository.save(inv);
        }
    }

    private void finalizePayment(Registration reg, String status, String providerId) {
        reg.setPaymentStatus(status);
        registrationRepository.save(reg);

        // move reserved to sold when paid; release reserved when failed
        Map<String, Integer> requestedBySize = buildRequestedBySize(reg);
        Event event = reg.getEvent();
        for (Map.Entry<String, Integer> e : requestedBySize.entrySet()) {
            String[] parts = e.getKey().split(":");
            String type = parts[0];
            String size = parts[1];
            ShirtInventory inv = shirtInventoryRepository.findByEvent(event).stream()
                    .filter(i -> Objects.equals(i.getType(), type) && Objects.equals(i.getSize(), size))
                    .findFirst()
                    .orElse(null);
            if (inv == null) continue;
            int qty = e.getValue();
            if ("paid".equals(status)) {
                inv.setQuantityReserved(Math.max(0, inv.getQuantityReserved() - qty));
                inv.setQuantitySold(inv.getQuantitySold() + qty);
            } else {
                inv.setQuantityReserved(Math.max(0, inv.getQuantityReserved() - qty));
            }
            shirtInventoryRepository.save(inv);
        }

        Payment payment = new Payment();
        payment.setRegistration(reg);
        payment.setAmount(reg.getTotalAmount());
        payment.setCurrency("SGD");
        payment.setStatus(status);
        payment.setProvider("stripe");
        payment.setProviderId(providerId);
        payment.setCreatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
    }

    private Map<String, Integer> buildRequestedBySize(Registration reg) {
        Map<String, Integer> requested = new HashMap<>();
        List<RegistrationParticipant> participants = participantRepository.findAll().stream()
                .filter(p -> p.getRegistration().getId().equals(reg.getId()))
                .collect(Collectors.toList());
        for (RegistrationParticipant p : participants) {
            if (p.getTshirtSize() != null && p.getTshirtQty() != null) {
                String key = p.getTshirtType() + ":" + p.getTshirtSize();
                requested.merge(key, p.getTshirtQty(), Integer::sum);
            }
        }
        List<RegistrationShirt> extras = registrationShirtRepository.findByRegistration(reg);
        for (RegistrationShirt extra : extras) {
            String key = extra.getType() + ":" + extra.getSize();
            requested.merge(key, extra.getQuantity(), Integer::sum);
        }
        return requested;
    }
}


```

```java
package com.terryfoxrun.api.repo;

import com.terryfoxrun.api.domain.RegistrationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegistrationParticipantRepository extends JpaRepository<RegistrationParticipant, Long> {
    Optional<RegistrationParticipant> findByPickupToken(String pickupToken);
    Optional<RegistrationParticipant> findByPickupCode(String pickupCode);
}


```

Implemented Stripe-ready backend services, security, and inventory finalization.

Key updates
- Added Stripe SDK + properties; Auth0 JWT resource server stays in place.
- Added RegistrationShirt entity/repo and migration V3 to track extra shirt orders.
- Services now implemented:
  - RegistrationService: quote, create with inventory reservation, Stripe Checkout session (uses real Stripe if keys present, placeholder otherwise), webhook handler to finalize payments, move reserved→sold or release, create Payment records, generate pickup tokens.
  - CorporateOrder, Announcement, Inventory, Pickup, Export services wired through controllers.
  - EventService persists events, categories, and shirt inventory.
- Security rules enforced via JWT: public health/events/quote/create and webhook; /registrations/me needs PARTICIPANT/ADMIN; pickup needs VOLUNTEER/ADMIN; admin routes need ADMIN.
- DB migrations: V1 schema, V2 seed event (2025 current, 5K/10K, donation presets 20/50/100, shirt price 35, adult/kid sizes), V3 registration_shirts.

How to run
1) Set env: DATABASE_URL/USERNAME/PASSWORD; STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET; AUTH0_ISSUER, AUTH0_AUDIENCE.
2) From `backend/`: `mvn spring-boot:run`. Flyway will apply V1–V3 and seed the current event.
3) If Stripe keys are unset, the API returns placeholder checkout URLs; webhook will no-op.

Next steps (recommended)
- Add stronger role claim mapping if your Auth0 uses a different claim than `permissions`.
- Add Payment repository queries/exports and real finance CSV.
- Build frontend flows to call `/api/registrations/quote` and `/api/registrations` and surface the returned Stripe URL, plus pickup scanning UI.

---

**User**

Next steps (recommended)



Add stronger role claim mapping if your Auth0 uses a different claim than permissions.

Add Payment repository queries/exports and real finance CSV.

Build frontend flows to call /api/registrations/quote and /api/registrations and surface the returned Stripe URL, plus pickup scanning UI.



could you please explain the next steps further, and what i need to do?

---

**Cursor**

Here’s what to do next, step by step, and what you’ll need from your side.

1) Auth0 role/claim mapping
- Goal: ensure Spring sees roles as `ROLE_ADMIN`, `ROLE_VOLUNTEER`, `ROLE_PARTICIPANT`.
- In Auth0: create roles; assign them to users. Expose roles in the access token via a custom claim (e.g., `https://yourdomain.com/roles` or `permissions`).
- In backend: update `SecurityConfig` to read the claim you use:
  - If you use `https://yourdomain.com/roles`, set `delegate.setAuthoritiesClaimName("https://yourdomain.com/roles")`.
  - Keep `delegate.setAuthorityPrefix("ROLE_")`.
- Test with a token: call `/api/registrations/me` (needs PARTICIPANT), `/api/events` (public), `/api/pickup/scan` (VOLUNTEER), `/api/events/...` admin endpoints (ADMIN).

2) Payments export / finance CSV
- Add queries to `PaymentRepository` for payments by event and status.
- Implement `ExportService.financeCsv`: pull payments joined to registrations, include amount, currency, status, provider_id, created_at. Add totals (paid, failed) and donation breakdown if desired.
- (Optional) Add `PaymentRepository` lookup by provider_id for audit.

3) Frontend flows to registration + pickup
- Registration wizard:
  - Call `/api/events/current` to load categories, flags, donation presets, shirt sizes, price.
  - Step 1: choose category per participant (allow multiple participants).
  - Step 2: participant details (respect required/optional flags).
  - Step 3: shirts (per participant + extra shirts).
  - Step 4: donation (preset buttons 20/50/100 + custom; default 0).
  - Step 5: call `/api/registrations/quote` to show totals + any inventory warnings.
  - Step 6: call `/api/registrations` with `successUrl` and `cancelUrl`; redirect user to the returned `stripeCheckoutUrl`.
- Confirmation: after Stripe redirect, show success/cancel based on query params; optionally poll `/api/registrations/me` for status.
- Pickup UI:
  - Protected route for VOLUNTEER/ADMIN.
  - Form to enter code or scan QR (use a simple QR scanner lib).
  - Call `/api/pickup/scan` with token/code; display participant name, category, shirt size/type, current status, and mark collected.
  - Handle 404 (invalid code) gracefully.

4) Wire configuration and environment
- Backend:
  - Set `DATABASE_URL/USERNAME/PASSWORD`.
  - Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
  - Set `AUTH0_ISSUER`, `AUTH0_AUDIENCE`.
- Frontend:
  - Auth0 domain/client ID in env; wrap app with Auth0 provider; attach bearer token on protected API calls (registration create can be open; dashboard/admin/pickup need token).

5) Testing checklist
- Run `mvn spring-boot:run`; verify Flyway migrations applied.
- Hit `GET /api/events/current` → seeded event.
- Run a registration quote with a shirt size that exists → no warnings; use a fake size → warning.
- With Stripe keys set, create a registration and complete Checkout → ensure webhook updates payment to paid and inventory reserved→sold.
- Pickup: after payment, scan code/token → status becomes collected.

If you want, I can:
- Adjust `SecurityConfig` to a specific Auth0 roles claim you choose.
- Implement the finance CSV export with real payment data.
- Start building the registration wizard on the frontend and hook it to the quote/create endpoints.

---

**User**

can you walk me thorugh how I should set up Auth0?

---

**Cursor**

Here’s a practical, minimal Auth0 setup for this project.

What you’ll create in Auth0
- One “Regular Web Application” for the frontend (Next.js).
- One API (identifier = your audience) for the backend (Spring).
- Roles: ADMIN, VOLUNTEER, PARTICIPANT.
- Rule/action to put roles into access tokens (e.g., under a custom claim).

Step-by-step (Auth0 dashboard)
1) Create API (backend)
   - Go to Applications → APIs → “Create API”.
   - Name: “Terry Fox Run API”.
   - Identifier (audience): `https://api.terryfoxrun.sg` (or any URI you choose; it just needs to match backend config).
   - Signing algorithm: RS256 (default).

2) Create Application (frontend)
   - Applications → Applications → “Create Application”.
   - Type: “Regular Web Application”.
   - Allowed Callback URLs: `http://localhost:3000` (add prod later).
   - Allowed Logout URLs: `http://localhost:3000`.
   - Allowed Web Origins: `http://localhost:3000`.
   - Save Client ID and Domain (you’ll use these in the frontend).

3) Create Roles
   - User Management → Roles → Create: ADMIN, VOLUNTEER, PARTICIPANT.
   - Assign roles to your user(s): Users → select user → Roles → assign.

4) Add roles to access tokens
   - Go to Actions → Library → Build new Action (Post-Login).
   - Sample code to add roles claim:
     ```js
     exports.onExecutePostLogin = async (event, api) => {
       const roles = (event.authorization || {}).roles;
       if (roles) {
         api.idToken.setCustomClaim("https://yourdomain.com/roles", roles);
         api.accessToken.setCustomClaim("https://yourdomain.com/roles", roles);
       }
     };
     ```
   - Deploy, then add this Action to the Login Flow.
   - Note the claim name (`https://yourdomain.com/roles`). We’ll reference it in Spring.

Backend configuration (Spring)
- In `application.yml`, set:
  ```
  auth0:
    issuer: https://YOUR_TENANT.auth0.com/
    audience: https://api.terryfoxrun.sg
  ```
- In `SecurityConfig`, change the roles claim if needed:
  ```java
  delegate.setAuthoritiesClaimName("https://yourdomain.com/roles");
  delegate.setAuthorityPrefix("ROLE_");
  ```
- Ensure your JWT validator uses `issuer` and `audience` above (Spring resource server does this automatically if configured).

Frontend configuration (Next.js)
- Install Auth0 React SDK (if not yet): `npm install @auth0/auth0-react`.
- Wrap app with `Auth0Provider` using domain, clientId, and audience (`https://api.terryfoxrun.sg`).
- When calling protected backend endpoints (dashboard/admin/pickup), get an access token via `getAccessTokenSilently()` and send as `Authorization: Bearer <token>`.

Test flow
1) Log in via the frontend; ensure the user has a role (e.g., PARTICIPANT).
2) Call a protected endpoint like `/api/registrations/me` with the access token → should return 200.
3) Try an admin endpoint with a non-admin user → should get 403.
4) Check the decoded access token at jwt.io: confirm `aud` = your API identifier, `iss` = your tenant, and your custom roles claim includes the right roles.

If you tell me your chosen custom claim name (e.g., `https://terryfoxrun.sg/roles`), I can update `SecurityConfig` accordingly.

```javascript
     exports.onExecutePostLogin = async (event, api) => {
       const roles = (event.authorization || {}).roles;
       if (roles) {
         api.idToken.setCustomClaim("https://yourdomain.com/roles", roles);
         api.accessToken.setCustomClaim("https://yourdomain.com/roles", roles);
       }
     };
```

```plaintext
  auth0:
    issuer: https://YOUR_TENANT.auth0.com/
    audience: https://api.terryfoxrun.sg
```

```java
  delegate.setAuthoritiesClaimName("https://yourdomain.com/roles");
  delegate.setAuthorityPrefix("ROLE_");
```

