# Terry Fox Run Frontend

Next.js App Router frontend for the Terry Fox Run Singapore MVP.

## Commands

```bash
npm install
npm run dev
npm run build
npm run test:smoke
```

The app defaults to `http://127.0.0.1:8080` for the backend API. Override it with
`NEXT_PUBLIC_API_BASE_URL` when testing against another backend.

The Playwright smoke tests mock backend API responses and cover the main public,
registration, confirmation, dashboard, and admin payment flows on desktop and mobile.
