import { NextRequest, NextResponse } from "next/server";
import { generateAllPosts } from "@/lib/agents";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    const { success, retryAfterSec } = await checkRateLimit(ip);
    if (!success) {
      const mins = Math.ceil(retryAfterSec / 60);
      return NextResponse.json(
        {
          error: `You've shipped 10 thought-leadership pieces this hour. Even the grindset needs a cooldown — circle back in ${mins} minute${mins === 1 ? "" : "s"}. 🚀`,
        },
        { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
      );
    }

    const formData = await req.formData();
    const prompt = formData.get("prompt") as string;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    console.log("[generate] Starting generation for:", prompt);

    const posts = await generateAllPosts(prompt);
    console.log("[generate] Generated", posts.length, "posts");

    return NextResponse.json({ posts });
  } catch (err: unknown) {
    console.error("Generate error:", err);
    let message = "Unknown error";
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'object' && err !== null) {
      message = JSON.stringify(err);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
