import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

const TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days
const MAX_POST_LENGTH = 4000;

function makeId(): string {
  // 8 url-safe chars, ~48 bits
  return randomBytes(6).toString("base64url");
}

export async function POST(req: NextRequest) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json(
      { error: "Sharing is down for maintenance. The synergy will return." },
      { status: 503 },
    );
  }

  try {
    const { post, pattern } = await req.json();

    if (typeof post !== "string" || !post.trim() || post.length > MAX_POST_LENGTH) {
      return NextResponse.json({ error: "post is required" }, { status: 400 });
    }

    const redis = Redis.fromEnv();
    const id = makeId();
    await redis.set(
      `share:${id}`,
      JSON.stringify({
        post: post.trim(),
        pattern: typeof pattern === "string" ? pattern.slice(0, 40) : "unknown",
        createdAt: new Date().toISOString(),
      }),
      { ex: TTL_SECONDS },
    );

    return NextResponse.json({ id, url: `/p/${id}` });
  } catch (err) {
    console.error("Share error:", err);
    return NextResponse.json({ error: "Could not create link" }, { status: 500 });
  }
}
