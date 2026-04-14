import { NextRequest, NextResponse } from "next/server";
import { generateAllPosts } from "@/lib/agents";
import { evaluateAllPosts, synthesizePosts } from "@/lib/evaluator";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("prompt") as string;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    console.log("[generate] Starting generation for:", prompt);

    const generatedPosts = await generateAllPosts(prompt);
    console.log("[generate] Phase 1 complete, generated:", generatedPosts.length, "posts");

    const evaluatedPosts = await evaluateAllPosts(generatedPosts);
    console.log("[generate] Phase 2 complete, evaluated:", evaluatedPosts.length, "posts");

    evaluatedPosts.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    const synthesis = await synthesizePosts(generatedPosts);
    console.log("[generate] Phase 3 complete, synthesis:", synthesis);

    return NextResponse.json({
      posts: evaluatedPosts,
      synthesis,
    });
  } catch (err: unknown) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
