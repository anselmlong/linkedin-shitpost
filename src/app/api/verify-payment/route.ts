import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_API_KEY) {
    return NextResponse.json({ success: false, error: 'Stripe not configured' }, { status: 500 });
  }
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ success: false, error: 'Redis not configured' }, { status: 500 });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_API_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ success: false, error: 'Payment not completed' }, { status: 400 });
    }

    const redis = Redis.fromEnv();
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
