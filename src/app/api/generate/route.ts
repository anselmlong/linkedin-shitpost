import { NextRequest, NextResponse } from "next/server";
import { generateAllPosts } from "@/lib/agents";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
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
