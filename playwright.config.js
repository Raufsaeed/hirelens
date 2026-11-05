// @ts-check
import { defineConfig, devices } from "@playwright/test";

// Test helpers need the Supabase keys. Node loads them from .env.local at run time,
// so no key is ever written into a test file.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: tests that need Supabase will fail with a clear error.
}

// End-to-end tests live in tests/e2e/, one file per feature.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  // One test at a time: all tests share one local dev server and one Supabase project.
  workers: 1,
  retries: 0,
  // Log in and save actions can wait for Supabase retries (1s, 2s, 4s), so allow 10s per check.
  expect: { timeout: 10 * 1000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    // Every test page answers AI calls from tests/e2e/fixtures/ (development only), so tests never use
    // the Gemini free quota. The one real-AI test (RUN_REAL_AI=1) sets its own cookie.
    storageState: {
      cookies: [
        { name: "hl_ai_test", value: "fixture:screening", domain: "localhost", path: "/", expires: -1, httpOnly: false, secure: false, sameSite: "Lax" },
        // Emails are captured to a temp file instead of being sent with Resend (lib/email/test-mode.js).
        { name: "hl_email_test", value: "capture", domain: "localhost", path: "/", expires: -1, httpOnly: false, secure: false, sameSite: "Lax" },
      ],
      origins: [],
    },
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Starts the dev server for the tests, or reuses one that is already running.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
