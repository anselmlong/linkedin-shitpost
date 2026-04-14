import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getModel = (model: string) => openai(model);

export const MODELS = {
  generate: "gpt-5-nano-2025-08-07"
} as const;
