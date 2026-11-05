import { TEST_PASSWORD } from "./test-accounts";

// The development-only cookie that tells the app how to answer AI calls (see lib/ai/test-mode.js).
// Tests use the saved response in tests/e2e/fixtures/gemini-screening.json by default, so they never
// use the Gemini free quota. Only the RUN_REAL_AI test calls the real API.
export const BASE_URL = "http://localhost:3000";
export function aiCookie(mode = "fixture:screening") {
  return [{ name: "hl_ai_test", value: mode, url: BASE_URL }];
}

// Logs in through the real Log in page.
export async function logIn(page, email, password = TEST_PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/(hr\/dashboard|my-applications)/);
}

// Logs in once and returns the session cookies, so tests can reuse them
// (fewer logins keeps the suite under Supabase's sign-in rate limit).
export async function sessionCookies(browser, email) {
  const context = await browser.newContext();
  await logIn(await context.newPage(), email);
  const cookies = await context.cookies();
  await context.close();
  return cookies.filter((cookie) => cookie.name !== "hl_ai_test");
}

// Opens a page as that user. Adds the fake-AI cookie unless the test passed its own hl_ai_test cookie.
export async function openWithSession(page, cookies, path = "/") {
  const hasAiCookie = cookies.some((cookie) => cookie.name === "hl_ai_test");
  await page.context().clearCookies();
  await page.context().addCookies(hasAiCookie ? cookies : [...cookies, ...aiCookie()]);
  await page.goto(path);
  // Wait until the page's scripts have loaded, so clicks, drags and file inputs are handled
  // (right after a dev-server recompile, React can still be attaching its handlers).
  await page.waitForLoadState("networkidle");
}

// In fake-AI mode the app saves the last prompt it would have sent to Gemini here (development only),
// so privacy tests can check what AI would receive.
export async function lastAiPrompt() {
  const { readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const path = await import("node:path");
  return readFile(path.join(tmpdir(), "hirelens-ai-test-prompt.txt"), "utf8");
}
