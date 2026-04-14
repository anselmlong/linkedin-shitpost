import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const config = {
  matcher: '/api/generate',
};

export async function proxy(req: NextRequest) {
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
