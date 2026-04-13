import { NextRequest, NextResponse } from "next/server";
import { generateAllPosts } from "@/lib/agents";
import { evaluateAllPosts, synthesizePosts } from "@/lib/evaluator";
import { transcribeImage } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("prompt") as string;
    const imageBase64 = formData.get("imageBase64") as string | null;
    const mimeType = (formData.get("mimeType") as string) || "image/jpeg";

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    let imageTranscription: string | undefined;

    // If image provided, transcribe with Gemini Vision
    if (imageBase64) {
      try {
        imageTranscription = await transcribeImage(imageBase64, mimeType);
      } catch (err) {
        console.error("Image transcription failed:", err);
        // Continue without transcription
      }
    }

    // Phase 1: generate all 5 posts in parallel
    const generatedPosts = await generateAllPosts(prompt, imageTranscription);

    // Phase 2: evaluate all posts in parallel
    const evaluatedPosts = await evaluateAllPosts(generatedPosts);

    // Sort by score descending
    evaluatedPosts.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    // Phase 3: synthesis — director's cut + roast mode
    const synthesis = await synthesizePosts(generatedPosts);

    return NextResponse.json({
      posts: evaluatedPosts,
      synthesis,
      imageTranscription,
    });
  } catch (err: unknown) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
