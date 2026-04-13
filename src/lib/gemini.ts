import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function transcribeImage(base64Image: string, mimeType: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const imagePart = {
    inlineData: { data: base64Image, mimeType },
  };
  const result = await model.generateContent([
    "Transcribe ALL text you see in this image exactly as it appears. If there are no words, describe what you see briefly.",
    imagePart,
  ]);
  return result.response.text();
}
