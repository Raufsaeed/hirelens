import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Prompts live only in prompts/*.txt.

export async function readPromptFile(fileName) {
  return readFile(path.join(process.cwd(), "prompts", fileName), "utf8");
}

// Fills {{NAME}} placeholders in a prompt file with the given values.
export async function loadPrompt(fileName, values) {
  const template = await readPromptFile(fileName);
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (match, key) => (key in values ? String(values[key]) : match));
}
