import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getModel = (model: string) => openai(model);

export const MODELS = {
  generate: "gpt-4.1-nano",
} as const;
