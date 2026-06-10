import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Per-IP rate limiting for the generation endpoint (calls paid LLM APIs).
 *
 * Uses Upstash Redis (sliding window, 10/hour) when
 * UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN are set — the same
 * env vars the payment flow already relies on. Without them, falls back
 * to a best-effort in-memory window; on serverless this only bounds
 * abuse per warm instance, so configure Upstash in production.
 */

const LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const upstashLimiter = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(LIMIT, "1 h"),
      prefix: "shitpost:gen",
    })
  : null;

// In-memory fallback: ip -> timestamps of recent requests
const memoryHits = new Map<string, number[]>();
let warnedFallback = false;

function memoryCheck(ip: string): { success: boolean; resetMs: number } {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const hits = (memoryHits.get(ip) ?? []).filter((t) => t > cutoff);
  if (hits.length >= LIMIT) {
    memoryHits.set(ip, hits);
    return { success: false, resetMs: hits[0]! + WINDOW_MS - now };
  }
  hits.push(now);
  memoryHits.set(ip, hits);
  // Opportunistic cleanup so the map can't grow unbounded
  if (memoryHits.size > 5000) {
    for (const [k, v] of memoryHits) {
      if (v.every((t) => t <= cutoff)) memoryHits.delete(k);
    }
  }
  return { success: true, resetMs: 0 };
}

export async function checkRateLimit(
  ip: string,
): Promise<{ success: boolean; retryAfterSec: number }> {
  if (upstashLimiter) {
    const { success, reset } = await upstashLimiter.limit(ip);
    return {
      success,
      retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  }
  if (!warnedFallback) {
    warnedFallback = true;
    console.warn(
      "[ratelimit] UPSTASH_REDIS_REST_URL/TOKEN not set — using per-instance in-memory fallback",
    );
  }
  const { success, resetMs } = memoryCheck(ip);
  return { success, retryAfterSec: Math.max(1, Math.ceil(resetMs / 1000)) };
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
