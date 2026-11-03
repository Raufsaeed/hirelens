import { GoogleGenAI } from "@google/genai";

// SERVER ONLY. Gemini client using the official SDK and the native Gemini endpoint.

// One model name for the whole app, so it is easy to change later.
export const GEMINI_MODEL = "gemini-flash-latest";

let geminiClient = null;

// Creates the client once and reuses it, so the key is passed only once.
export function getGeminiClient() {
  if (typeof window !== "undefined") {
    throw new Error("The Gemini client can only be used on the server.");
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}
