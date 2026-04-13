import { generateText } from "ai";
import { getModel, MODELS } from "./openrouter";
import type { GeneratedPost } from "./agents";

const SYSTEM_EVALUATE = `You are evaluating generated LinkedIn shitposts for humor and viral potential.

Score each post on (1-10, integers only):
- humor: How funny is this? Does it land?
- virality: Would a LinkedIn user share this? Would it get engagement?
- originality: Is this fresh or derivative?
- cringe_authenticity: Does it feel authentically written (high = reads like a real person fell into this trap)

Total score = humor×0.4 + virality×0.3 + originality×0.2 + cringe×0.1

Respond with ONLY valid JSON:
{"scores": {"humor": N, "virality": N, "originality": N, "cringe_authenticity": N}, "total": N, "reasoning": "brief one-liner"}`;

const SYSTEM_SYNTHESIZE = `You are an editor who just received 5 drafts of a LinkedIn shitpost from different comedy writers. Your job is to create two final outputs.

INPUT: 5 draft posts from: tech-bro, absurdist, unhinged, ragebait, lowercase-tryhard

OUTPUT 1 — DIRECTOR'S CUT:
Read all 5 drafts carefully. Identify the strongest individual elements:
- best opening hook (makes people stop scrolling)
- best escalation (where the post gets funniest)
- best punchline / ending
- best specific detail (a funny made-up stat, absurd specificity)
- best structure

Combine the strongest elements into ONE post that reads as a cohesive whole. It should feel like the best writer among the 5 was working with all their ideas. Keep it 150-250 words.

OUTPUT 2 — ROAST MODE:
Take the most viral-capable elements from the drafts and push them further. If one has a good hook and another has a good ending, combine them and make the ending MORE extreme. If the ragebait has a relatable complaint, make it MORE absurd. This is the "if you thought that was good, wait for this" version. 120-200 words.

For both outputs: respond in character, no meta-commentary, just deliver the posts.

Respond with ONLY this JSON (no markdown, no explanation):
{
  "directors_cut": "full post text here",
  "roast_mode": "full post text here"
}`;

export async function evaluatePost(post: GeneratedPost): Promise<{ total: number; reasoning: string }> {
  const { text } = await generateText({
    model: getModel(MODELS.evaluate),
    system: SYSTEM_EVALUATE,
    prompt: `Evaluate this LinkedIn post:\n\n${post.post}`,
    temperature: 0.3,
    maxOutputTokens: 200,
  });

  try {
    const parsed = JSON.parse(text);
    return { total: parsed.total, reasoning: parsed.reasoning };
  } catch {
    return { total: 5, reasoning: "eval failed, defaulting" };
  }
}

export async function evaluateAllPosts(posts: GeneratedPost[]): Promise<GeneratedPost[]> {
  const results = await Promise.all(
    posts.map(async (post) => {
      const { total } = await evaluatePost(post);
      return { ...post, score: total };
    })
  );
  return results;
}

export async function synthesizePosts(posts: GeneratedPost[]): Promise<{
  directors_cut: string;
  roast_mode: string;
}> {
  const postsText = posts
    .map((p) => `[${p.pattern.toUpperCase()}]:\n${p.post}`)
    .join("\n\n---\n\n");

  const { text } = await generateText({
    model: getModel(MODELS.synthesize),
    system: SYSTEM_SYNTHESIZE,
    prompt: `Here are 5 draft LinkedIn shitposts:\n\n${postsText}`,
    temperature: 1.0,
    maxOutputTokens: 800,
  });

  try {
    return JSON.parse(text);
  } catch {
    return {
      directors_cut: posts[0]?.post ?? "Synthesis failed",
      roast_mode: posts[1]?.post ?? "Roast failed",
    };
  }
}
