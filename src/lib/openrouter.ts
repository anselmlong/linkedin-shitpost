import { createOpenAI } from "@ai-sdk/openai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const getModel = (model = "anthropoid/haiku") =>
  openrouter(model);

export const MAIN = "openrouter/free"
export const MODELS = {
  generate: MAIN,
  evaluate: MAIN,
  synthesize: MAIN
} as const;
