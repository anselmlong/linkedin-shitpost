# Rate Limiting + Donation Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a soft client-side rate limit (3/day) with an earnest donation modal, a hard server-side ceiling (10/day via Upstash), and a Stripe Checkout flow that grants 30-day unlimited access.

**Architecture:** Client-side localStorage tracks usage and shows the modal at 3 generations; users can bypass it once per session. Next.js edge middleware enforces a hard 10/day limit via Upstash Redis and skips it for users with a valid `paid_token` cookie. Stripe Checkout handles payment; a verify-payment route issues the cookie token after confirming payment.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, Stripe SDK, @upstash/redis, @upstash/ratelimit, Vitest + jsdom

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/usageTracker.ts` | Create | localStorage counter + session modal flag |
| `src/components/DonationModal.tsx` | Create | Modal with voluntary/soft/hard modes |
| `src/middleware.ts` | Create | Edge rate limiting + paid token bypass |
| `src/app/api/checkout/route.ts` | Create | Stripe Checkout Session creation |
| `src/app/api/verify-payment/route.ts` | Create | Post-payment token issuance |
| `src/app/page.tsx` | Modify | Support button, modal state, usageTracker calls, 429 handling, thank-you state |
| `vitest.config.ts` | Create | Vitest + jsdom config |
| `src/lib/usageTracker.test.ts` | Create | Unit tests for usageTracker |

---

## Task 1: Install dependencies and set up Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install runtime and dev dependencies**

```bash
bun add stripe @upstash/redis @upstash/ratelimit
bun add -d vitest @vitest/globals jsdom @types/jsdom
```

Expected output: packages added to `bun.lock` and `package.json`.

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts` at the project root:

```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 3: Add test script to package.json**

In `package.json`, add `"test": "vitest run"` to the `scripts` section:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run"
}
```

- [ ] **Step 4: Verify vitest runs**

```bash
bun test
```

Expected: `No test files found` (no error, just no tests yet).

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json bun.lock
git commit -m "chore: add stripe, upstash, vitest dependencies"
```

---

## Task 2: usageTracker — localStorage counter (TDD)

**Files:**
- Create: `src/lib/usageTracker.ts`
- Create: `src/lib/usageTracker.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/usageTracker.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUsage,
  incrementUsage,
  isSoftLimitHit,
  markModalSeen,
  hasSeenModalThisSession,
  _resetSessionFlag,
} from './usageTracker';

const STORAGE_KEY = 'shitpost_usage';

beforeEach(() => {
  localStorage.clear();
  _resetSessionFlag();
});

describe('getUsage', () => {
  it('returns count 0 when nothing stored', () => {
    expect(getUsage().count).toBe(0);
  });

  it('resets count to 0 when 24h window has expired', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count: 5, windowStart: Date.now() - 25 * 60 * 60 * 1000 })
    );
    expect(getUsage().count).toBe(0);
  });

  it('returns stored count when within 24h window', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count: 2, windowStart: Date.now() - 1000 })
    );
    expect(getUsage().count).toBe(2);
  });
});

describe('incrementUsage', () => {
  it('increments count from 0 to 1', () => {
    incrementUsage();
    expect(getUsage().count).toBe(1);
  });

  it('increments count cumulatively', () => {
    incrementUsage();
    incrementUsage();
    incrementUsage();
    expect(getUsage().count).toBe(3);
  });
});

describe('isSoftLimitHit', () => {
  it('returns false when count is below 3', () => {
    incrementUsage();
    incrementUsage();
    expect(isSoftLimitHit()).toBe(false);
  });

  it('returns true when count reaches 3', () => {
    incrementUsage();
    incrementUsage();
    incrementUsage();
    expect(isSoftLimitHit()).toBe(true);
  });

  it('returns true when count exceeds 3', () => {
    for (let i = 0; i < 5; i++) incrementUsage();
    expect(isSoftLimitHit()).toBe(true);
  });
});

describe('session modal flag', () => {
  it('hasSeenModalThisSession returns false initially', () => {
    expect(hasSeenModalThisSession()).toBe(false);
  });

  it('returns true after markModalSeen', () => {
    markModalSeen();
    expect(hasSeenModalThisSession()).toBe(true);
  });

  it('_resetSessionFlag clears the flag', () => {
    markModalSeen();
    _resetSessionFlag();
    expect(hasSeenModalThisSession()).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
bun test
```

Expected: FAIL with `Cannot find module './usageTracker'`

- [ ] **Step 3: Implement usageTracker.ts**

Create `src/lib/usageTracker.ts`:

```typescript
const STORAGE_KEY = 'shitpost_usage';
const WINDOW_MS = 24 * 60 * 60 * 1000;
const SOFT_LIMIT = 3;

interface Usage {
  count: number;
  windowStart: number;
}

let sessionModalSeen = false;

export function getUsage(): Usage {
  if (typeof window === 'undefined') return { count: 0, windowStart: Date.now() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, windowStart: Date.now() };
    const usage = JSON.parse(raw) as Usage;
    if (Date.now() - usage.windowStart > WINDOW_MS) {
      return { count: 0, windowStart: Date.now() };
    }
    return usage;
  } catch {
    return { count: 0, windowStart: Date.now() };
  }
}

export function incrementUsage(): void {
  const usage = getUsage();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ count: usage.count + 1, windowStart: usage.windowStart })
  );
}

export function isSoftLimitHit(): boolean {
  return getUsage().count >= SOFT_LIMIT;
}

export function markModalSeen(): void {
  sessionModalSeen = true;
}

export function hasSeenModalThisSession(): boolean {
  return sessionModalSeen;
}

/** Only for tests — resets the in-memory session flag */
export function _resetSessionFlag(): void {
  sessionModalSeen = false;
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
bun test
```

Expected: all 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/usageTracker.ts src/lib/usageTracker.test.ts
git commit -m "feat: add usageTracker with localStorage soft rate limit"
```

---

## Task 3: DonationModal component

**Files:**
- Create: `src/components/DonationModal.tsx`

- [ ] **Step 1: Create DonationModal.tsx**

Create `src/components/DonationModal.tsx`:

```tsx
'use client';

import { useState } from 'react';

export type ModalMode = 'voluntary' | 'soft' | 'hard';

interface DonationModalProps {
  mode: ModalMode;
  onClose: () => void;
  onBypass?: () => void;
}

const COPY: Record<ModalMode, { title: string; body: string }> = {
  voluntary: {
    title: 'Buy me a coffee',
    body: 'API costs money... would appreciate buying me a coffee if this made you laugh 🙏',
  },
  soft: {
    title: 'hey, real quick',
    body: "okay so you've used this a few times now. look — i'm a broke college student and these AI API calls genuinely cost money. i'm not asking for much. even $1 helps keep this running. please? 🥺",
  },
  hard: {
    title: "okay you've really gone to town",
    body: "you've hit the daily limit. i respect the dedication, genuinely. but the wall is real this time — it resets in 24 hours. if you want to keep going RIGHT now, you can support the cause and get unlimited generations for 30 days. please? 🥺",
  },
};

export default function DonationModal({ mode, onClose, onBypass }: DonationModalProps) {
  const [amount, setAmount] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSupport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.max(1, parseFloat(amount) || 1) }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Something went wrong. Try again.');
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  const copy = COPY[mode];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl relative">
        {mode !== 'hard' && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-[#999] hover:text-[#333] text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        )}

        <h2 className="text-base font-bold text-[#191919] mb-2">{copy.title}</h2>
        <p className="text-sm text-[#555] mb-4 leading-relaxed">{copy.body}</p>

        <div className="mb-4">
          <label className="text-xs text-[#666] block mb-1.5">How much?</label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#333]">$</span>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-[#E0DFDC] rounded px-2 py-1.5 text-sm w-20 focus:outline-none focus:border-[#0A66C2]"
            />
            {amount === '1' && (
              <span className="text-xs text-[#999]">(I get 67¢ of that)</span>
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 mb-3">{error}</p>
        )}

        <button
          onClick={handleSupport}
          disabled={loading}
          className="w-full bg-[#0A66C2] text-white rounded-full py-2 text-sm font-semibold hover:bg-[#004182] transition-colors disabled:opacity-50 mb-2"
        >
          {loading ? 'Redirecting to Stripe...' : 'Support me'}
        </button>

        {mode === 'soft' && onBypass && (
          <button
            onClick={onBypass}
            className="w-full text-[#666] text-xs py-1.5 hover:text-[#333] transition-colors"
          >
            I&apos;m broke too, let me through
          </button>
        )}

        {mode === 'hard' && (
          <button
            onClick={onClose}
            className="w-full text-[#666] text-xs py-1.5 hover:text-[#333] transition-colors"
          >
            okay fine :(
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bun run build 2>&1 | head -30
```

Expected: build succeeds or only fails on unrelated issues (the component isn't used yet).

- [ ] **Step 3: Commit**

```bash
git add src/components/DonationModal.tsx
git commit -m "feat: add DonationModal component with voluntary/soft/hard modes"
```

---

## Task 4: Stripe Checkout API route

**Files:**
- Create: `src/app/api/checkout/route.ts`

- [ ] **Step 1: Add STRIPE_SECRET_KEY to local .env**

Create or update `.env.local` (this file is gitignored):

```
STRIPE_SECRET_KEY=sk_test_...   # get from https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

To get the test key: go to Stripe Dashboard → Developers → API keys → copy the Secret key (`sk_test_...`).

- [ ] **Step 2: Create the checkout route**

Create `src/app/api/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://shitpost.anselmlong.com';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    const amountCents = Math.round(Math.max(1, Number(amount) || 1) * 100);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Support the LinkedIn Shitpost Generator ☕' },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/?donated=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Start the dev server and test the route manually**

```bash
bun dev
```

In a separate terminal:

```bash
curl -s -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"amount": 1}' | jq .
```

Expected output:
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/checkout/route.ts
git commit -m "feat: add Stripe Checkout Session API route"
```

---

## Task 5: Payment verification API route

**Files:**
- Create: `src/app/api/verify-payment/route.ts`

- [ ] **Step 1: Add Upstash env vars to .env.local**

Add to `.env.local`:

```
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

To get these: create a free account at upstash.com → create a Redis database → copy the REST URL and token from the database dashboard.

- [ ] **Step 2: Create the verify-payment route**

Create `src/app/api/verify-payment/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const redis = Redis.fromEnv();

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ success: false, error: 'Payment not completed' }, { status: 400 });
    }

    const token = randomUUID();
    const ttl = 30 * 24 * 60 * 60; // 30 days in seconds
    await redis.set(`paid:${token}`, '1', { ex: ttl });

    const response = NextResponse.json({ success: true });
    response.cookies.set('paid_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ttl,
      path: '/',
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
bun run build 2>&1 | head -30
```

Expected: no new TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/verify-payment/route.ts
git commit -m "feat: add verify-payment route, issues 30-day paid_token cookie"
```

---

## Task 6: Edge middleware — hard rate limit

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create middleware.ts**

Create `src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const config = {
  matcher: '/api/generate',
};

export async function middleware(req: NextRequest) {
  // Skip if Upstash isn't configured (local dev without Redis)
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.next();
  }

  const redis = Redis.fromEnv();

  // Paid users bypass the hard limit
  const paidToken = req.cookies.get('paid_token')?.value;
  if (paidToken) {
    const isPaid = await redis.get(`paid:${paidToken}`);
    if (isPaid) return NextResponse.next();
  }

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '24 h'),
    prefix: 'shitpost_rl',
  });

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      {
        error: 'rate_limit',
        message: "You've hit the daily limit. Try again tomorrow or support the project!",
      },
      { status: 429 }
    );
  }

  return NextResponse.next();
}
```

- [ ] **Step 2: Test that the middleware doesn't break local dev**

```bash
bun dev
```

Submit a generation. Should work normally (middleware skips when env vars are missing).

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add edge middleware with Upstash hard rate limit (10/day)"
```

---

## Task 7: Wire up page.tsx — Support button + modal state

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add modal state and Support button to page.tsx**

Open `src/app/page.tsx`. Make the following changes:

**Add imports** at the top (after the existing imports):

```typescript
import DonationModal, { type ModalMode } from "@/components/DonationModal";
import { isSoftLimitHit, hasSeenModalThisSession, markModalSeen, incrementUsage } from "@/lib/usageTracker";
```

**Add state variables** inside the `Home` component (after the existing `useState` calls):

```typescript
const [modalMode, setModalMode] = useState<ModalMode | null>(null);
const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
const [thankYou, setThankYou] = useState(false);
```

**Replace the existing `handleGenerate` function** with this version:

```typescript
const handleGenerate = async (prompt: string) => {
  // Show soft wall if limit hit and user hasn't dismissed this session
  if (isSoftLimitHit() && !hasSeenModalThisSession()) {
    setPendingPrompt(prompt);
    setModalMode('soft');
    return;
  }

  setIsLoading(true);
  setError(null);
  setUsedPrompt(prompt);

  try {
    const fd = new FormData();
    fd.append("prompt", prompt);

    const res = await fetch("/api/generate", { method: "POST", body: fd });
    const data = await res.json();

    console.log("[page] Response status:", res.status);
    console.log("[page] Response data:", data);

    if (res.status === 429) {
      setModalMode('hard');
      return;
    }

    if (!res.ok) throw new Error(data.error || "Generation failed");

    incrementUsage();
    setPosts(data.posts);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong");
  } finally {
    setIsLoading(false);
  }
};
```

**Add bypass handler** after `handleGenerate`:

```typescript
const handleBypass = () => {
  markModalSeen();
  setModalMode(null);
  if (pendingPrompt) {
    const p = pendingPrompt;
    setPendingPrompt(null);
    handleGenerate(p);
  }
};
```

**Add Support button** to the header — replace the existing `<header>` content with:

```tsx
<header className="bg-white border-b border-[#E0DFDC] sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
  <div className="max-w-3xl mx-auto px-4 h-12 flex items-center gap-3">
    <div className="w-7 h-7 bg-[#0A66C2] rounded flex items-center justify-center flex-shrink-0">
      <span className="text-white font-extrabold text-base leading-none">in</span>
    </div>
    <div className="flex items-baseline gap-1.5 flex-1">
      <span className="text-sm font-semibold text-[#191919]">Shitpost Generator</span>
      <span className="text-xs text-[#666]">— don&apos;t actually post these</span>
    </div>
    <button
      onClick={() => setModalMode('voluntary')}
      className="text-xs font-semibold text-[#0A66C2] border border-[#0A66C2] rounded-full px-3 py-1 hover:bg-[#EEF3FB] transition-colors flex-shrink-0"
    >
      Support
    </button>
  </div>
</header>
```

**Add modal rendering** just before the closing `</div>` of the outermost `<div className="min-h-screen...">`:

```tsx
{modalMode && (
  <DonationModal
    mode={modalMode}
    onClose={() => setModalMode(null)}
    onBypass={modalMode === 'soft' ? handleBypass : undefined}
  />
)}
```

- [ ] **Step 2: Run the dev server and verify the Support button appears**

```bash
bun dev
```

Open `http://localhost:3000`. Confirm:
- "Support" button appears in the top-right of the nav
- Clicking it opens the modal with the "API costs money" copy
- The × button closes it

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add Support button and modal state to page.tsx"
```

---

## Task 8: Wire up thank-you state after Stripe return

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add payment verification on page load**

Add a `useEffect` inside the `Home` component (after the existing `useEffect` for loading messages):

```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const donated = params.get('donated');
  const sessionId = params.get('session_id');

  if (donated !== 'true' || !sessionId) return;

  // Clear params from URL without reload
  window.history.replaceState({}, '', '/');

  fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) setThankYou(true);
    })
    .catch(() => {/* silent fail */});
}, []);
```

- [ ] **Step 2: Add thank-you banner to the JSX**

In the `<main>` section of `page.tsx`, add this block directly after `<InputPanel .../>` and before the `{error && ...}` block:

```tsx
{thankYou && (
  <div className="bg-[#EEF3FB] border border-[#0A66C2]/30 rounded-lg p-3 text-sm text-[#0A66C2] text-center">
    you&apos;re a legend, genuinely thank you 🙏 you&apos;ve got unlimited generations for 30 days.
  </div>
)}
```

- [ ] **Step 3: Test the thank-you flow manually**

In the browser, navigate to:
```
http://localhost:3000/?donated=true&session_id=cs_test_FAKE
```

Expected: the verify-payment call will fail (fake session ID), but the URL params should be stripped. No error should appear in the UI — the thank-you banner only shows on `data.success === true`.

To test the real flow end-to-end, complete a test payment via Stripe (use card number `4242 4242 4242 4242`, any future expiry, any CVC). Stripe will redirect back with a real `session_id` and the thank-you banner should appear.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: verify Stripe payment on return, show thank-you banner and set paid cookie"
```

---

## Task 9: Add Vercel environment variables and deploy

**Files:**
- No code changes — configuration only

- [ ] **Step 1: Add env vars in Vercel dashboard**

Go to your Vercel project → Settings → Environment Variables. Add:

| Name | Value | Environment |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` (production) or `sk_test_...` (preview) | Production / Preview |
| `UPSTASH_REDIS_REST_URL` | from Upstash dashboard | All |
| `UPSTASH_REDIS_REST_TOKEN` | from Upstash dashboard | All |

Note: use `sk_test_...` for Preview deployments and `sk_live_...` for Production only when you're ready to accept real payments.

- [ ] **Step 2: Run final build check locally**

```bash
bun run build
```

Expected: build succeeds with no TypeScript errors.

- [ ] **Step 3: Run tests one final time**

```bash
bun test
```

Expected: all tests pass.

- [ ] **Step 4: Push and verify on Vercel**

```bash
git push origin main
```

After deploy: open `https://shitpost.anselmlong.com`, click Support, complete a test payment (card `4242 4242 4242 4242`), confirm the thank-you banner appears and subsequent generations are no longer blocked.

---

## Self-Review

**Spec coverage check:**
- Client-side soft limit (3/day, localStorage) → Task 2 ✓
- Session modal seen flag (don't re-show after dismiss) → Task 2 + Task 7 ✓
- Server-side hard limit (10/day, Upstash) → Task 6 ✓
- Paid token bypass in middleware → Task 6 ✓
- DonationModal with voluntary/soft/hard modes → Task 3 ✓
- Amount input defaulting to $1 with 67¢ note → Task 3 ✓
- Support button in nav → Task 7 ✓
- Stripe Checkout route (dynamic amount) → Task 4 ✓
- verify-payment route + cookie issuance → Task 5 ✓
- Thank-you state on return → Task 8 ✓
- 429 handling → Task 7 ✓
- 30-day unlimited access for paid users → Task 5 + Task 6 ✓

**Placeholder scan:** No TBDs or incomplete steps.

**Type consistency:**
- `ModalMode` exported from `DonationModal.tsx`, imported in `page.tsx` ✓
- `handleBypass` passed as `onBypass` prop only when `mode === 'soft'` ✓
- `incrementUsage`, `isSoftLimitHit`, `hasSeenModalThisSession`, `markModalSeen` all exported from `usageTracker.ts` and imported in `page.tsx` ✓
