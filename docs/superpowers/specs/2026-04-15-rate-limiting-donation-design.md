# Rate Limiting + Donation Gate — Design Spec

**Date:** 2026-04-15  
**Status:** Approved

## Overview

Add rate limiting to protect AI credits and a donation flow so users can support the project. The rate limit is a soft nudge (users can dismiss and continue) backed by a server-side hard ceiling. Paying users get unlimited generations for 30 days.

---

## Rate Limiting

### Client-side soft limit

- Tracked in `localStorage` as `{ count: number, windowStart: number }`
- After **3 generations** in a rolling 24-hour window, the donation modal appears in `soft` mode before the next request fires
- If the user dismisses ("I'm broke too, let me through"), the request fires anyway
- A session-level flag (in-memory, not localStorage) prevents the modal re-appearing on subsequent generations until the page is refreshed
- After each successful generation, the client increments the counter

File: `src/lib/usageTracker.ts`

### Server-side hard limit

- Upstash Redis, **10 generations per IP per 24 hours**, enforced in Next.js middleware at the edge
- Runs before the API route — blocked requests never reach the AI pipeline
- Returns `429` with JSON `{ error: "rate_limit", message: "..." }`
- If a valid `paid_token` cookie is present and not expired in Redis, the hard limit is skipped entirely

File: `src/middleware.ts`

---

## Donation Modal

A single `DonationModal` component with three modes controlled by a `mode` prop.

### Modes

**`voluntary`** — triggered by the "Support" button in the nav  
Copy: *"API costs money... would appreciate buying me a coffee if this made you laugh"*  
Buttons: "Support me" (Stripe) + close (X)  
No bypass needed.

**`soft`** — triggered when client-side soft limit is hit  
Copy: earnest broke college student plea  
Buttons: "Support me" (Stripe) + "I'm broke too, let me through" (dismisses + bypasses for session)

**`hard`** — triggered when server returns 429  
Copy: same earnest plea but makes clear the wall is real ("you've really gone to town today, resets in 24h")  
Buttons: "Support me" (Stripe) + "okay fine :(" (closes modal only, no bypass)

### Amount input

- Default: **$1** with a note: *"(I get 67¢ of that)"*
- User can increase the amount freely
- Minimum: $1 (Stripe floor is $0.50; $1 keeps the math simple)
- Amount is passed to `/api/checkout` when the user clicks "Support me"

File: `src/components/DonationModal.tsx`

---

## Nav Support Button

A "Support" button added to the top-right of the existing header in `page.tsx`. Clicking it opens the modal in `voluntary` mode. Styled to fit the existing LinkedIn-light nav.

---

## Stripe Checkout

A single API route that creates a Stripe Checkout Session with a dynamic price.

- Accepts `{ amount: number }` (dollars) in the request body
- Creates a `payment_intent`-mode Checkout Session with `price_data` set to the requested amount
- `success_url`: `https://shitpost.anselmlong.com/?donated=true&session_id={CHECKOUT_SESSION_ID}`
- `cancel_url`: `https://shitpost.anselmlong.com/`
- Returns `{ url: string }` — client does `window.location.href = url`
- Apple Pay and Google Pay are available automatically on the Stripe-hosted checkout page

File: `src/app/api/checkout/route.ts`

---

## Payment Verification

Called on page load when `?donated=true&session_id=xxx` is present in the URL.

1. Calls Stripe API to retrieve the Checkout Session and confirm `payment_status === "paid"`
2. Generates a UUID token
3. Stores `paid:{token} → "1"` in Upstash Redis with a **30-day TTL**
4. Sets an HttpOnly cookie `paid_token={token}` (30-day max-age)
5. Returns `{ success: true }`

Middleware checks: if `paid_token` cookie is present, look up `paid:{token}` in Redis. If found, skip rate limiting.

File: `src/app/api/verify-payment/route.ts`

---

## Thank-you State

On page load, if `?donated=true` is in the URL and verification succeeds, `page.tsx` shows a small inline thank-you message (e.g. *"you're a legend, thank you"*) near the top of the main content area. The query params are cleared from the URL after verification.

---

## New Files

| File | Purpose |
|---|---|
| `src/lib/usageTracker.ts` | localStorage counter logic |
| `src/components/DonationModal.tsx` | Modal with 3 modes |
| `src/middleware.ts` | Upstash edge rate limiting |
| `src/app/api/checkout/route.ts` | Stripe Checkout Session creation |
| `src/app/api/verify-payment/route.ts` | Post-payment token issuance |

## Modified Files

| File | Change |
|---|---|
| `src/app/page.tsx` | Support button in nav, modal state, thank-you state, 429 handling, usageTracker calls |

---

## Environment Variables

| Variable | Where |
|---|---|
| `STRIPE_SECRET_KEY` | Vercel env vars |
| `UPSTASH_REDIS_REST_URL` | Vercel env vars |
| `UPSTASH_REDIS_REST_TOKEN` | Vercel env vars |

---

## Out of Scope

- Tracking donor identity (email, name) — not needed for this use case
- Subscription/recurring payments — one-time donation only
- Webhook endpoint — payment verification uses session retrieval instead
- Analytics on donation conversion rate
