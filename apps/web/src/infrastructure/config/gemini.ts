import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Critical Configuration Missing: GEMINI_API_KEY environment variable is undefined.");
}

export const aiConfig = {
  apiKey: process.env.GEMINI_API_KEY,
};

// Initializing the official @google/genai SDK wrapper client
export const geminiClient = new GoogleGenAI({ apiKey: aiConfig.apiKey });

export const CHRONOX_AI_MODELS = {
  fastChat: "gemini-2.5-flash",
  complexReasoning: "gemini-2.5-pro",
};
