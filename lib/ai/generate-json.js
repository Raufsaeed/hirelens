import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { callWithRetry } from "@/lib/retry";

// One Gemini call that must return JSON. The response is parsed here; the caller checks its shape.
// Network errors and 429s are retried by callWithRetry (1s, 2s, 4s), with the Gemini call limit.

export class AiError extends Error {
  constructor(message) {
    super(message);
    this.name = "AiError";
  }
}

// Development-only test responses (see lib/ai/test-mode.js). Returns the response text, or null.
async function testResponse(testMode) {
  if (!testMode) return null;
  if (testMode.kind === "unavailable") throw new AiError("Gemini unavailable (test mode)");
  if (testMode.kind === "invalid-json") return "this is not json";
  const file = path.join(process.cwd(), "tests", "e2e", "fixtures", `gemini-${testMode.name}.json`);
  return readFile(file, "utf8");
}

export async function generateJson({ prompt, temperature = 0, testMode = null }) {
  let text = await testResponse(testMode);
  if (text === null) {
    const response = await callWithRetry("gemini", () =>
      getGeminiClient().models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: { temperature, responseMimeType: "application/json" },
      })
    );
    text = response?.text;
  }
  if (!text) throw new AiError("Gemini returned an empty response");
  try {
    return JSON.parse(text);
  } catch {
    throw new AiError("Gemini returned invalid JSON");
  }
}
