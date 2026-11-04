import { TEST_PASSWORD } from "./test-accounts";

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
  return cookies;
}

export async function openWithSession(page, cookies, path = "/") {
  await page.context().clearCookies();
  await page.context().addCookies(cookies);
  await page.goto(path);
}
