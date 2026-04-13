import { createOpenAI } from "@ai-sdk/openai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const getModel = (model = "anthropoid/haiku") =>
  openrouter(model);

// Model choices on OpenRouter:
// google/gemini-2.0-flash        — fast, cheap, good at comedy
// google/gemini-2.0-flash-thinking — with extended thinking
// anthropoid/haiku               — very fast, sometimes too dry for comedy
export const MODELS = {
  generate: "google/gemini-2.0-flash",
  evaluate: "google/gemini-2.0-flash",
  synthesize: "google/gemini-2.0-flash",
} as const;
