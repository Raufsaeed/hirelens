import "server-only";
import { GoogleGenAI } from "@google/genai";

// SERVER ONLY (the build fails if browser code imports this file).
// Gemini client using the official SDK and the native Gemini endpoint.

// One model name for the whole app. flash-lite: fast, and its free tier fits screening (the user chose it).
export const GEMINI_MODEL = "gemini-flash-lite-latest";

let geminiClient = null;

// Creates the client once and reuses it, so the key is passed only once.
export function getGeminiClient() {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}
