import { test, expect } from "@playwright/test";

// Setup smoke test: the app runs and the dev check reports every connection
// with only a name, ok and a short error (never a key).

const CHECK_NAMES = ["Gemini", "Supabase", "cvs bucket (private)", "logos bucket (public)"];

test("api/dev-check returns only name, ok and error for each check", async ({ request }) => {
  const response = await request.get("/api/dev-check");
  expect(response.ok()).toBeTruthy();
  const { checks } = await response.json();

  expect(checks.map((check) => check.name)).toEqual(CHECK_NAMES);
  for (const check of checks) {
    expect(Object.keys(check).sort()).toEqual(["error", "name", "ok"]);
    if (check.ok) {
      expect(check.error).toBeNull();
    } else {
      // A short, friendly message, not a raw error dump.
      expect(check.error.length).toBeGreaterThan(0);
      expect(check.error.length).toBeLessThan(80);
    }
  }
});

test("dev-check page shows a result for every check", async ({ page }) => {
  await page.goto("/dev-check");
  await expect(page.getByRole("heading", { name: "Setup check" })).toBeVisible();

  const rows = page.getByTestId("dev-check-row");
  await expect(rows).toHaveCount(CHECK_NAMES.length, { timeout: 30 * 1000 });
  for (const name of CHECK_NAMES) {
    await expect(rows.filter({ hasText: name })).toBeVisible();
  }
});
