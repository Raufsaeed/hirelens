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
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
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
