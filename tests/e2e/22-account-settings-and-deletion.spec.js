import { test, expect } from "@playwright/test";
import {
  TEST_PASSWORD,
  testEmail,
  createAccount,
  createJob,
  createApplication,
  findApplications,
  cvExists,
  emailChangeLink,
  openEmailLink,
  getProfile,
  deleteAccounts,
} from "./helpers/test-accounts";
import { logIn, sessionCookies, openWithSession } from "./helpers/session";
import { makePdf } from "./helpers/files";

// Feature 22 · Account Settings and Deletion. Dummy accounts are deleted after the run.
// Supabase's built-in mailer won't send to test addresses, so the email change link is created with
// the server key (the same link the confirmation email contains).

test.describe.configure({ mode: "serial" });

const PASSWORD_ERROR =
  "Password must be at least 8 characters and include one capital letter and one special character (like @)";
const createdEmails = [];
let sara;
let saraCookies;

test.beforeAll(async ({ browser }) => {
  const email = testEmail("sara-settings");
  createdEmails.push(email);
  sara = await createAccount({ role: "hr", fullName: "Sara", email, companyName: "ABC Tech" });
  saraCookies = await sessionCookies(browser, email);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

async function newCandidate(browser, name) {
  const email = testEmail(name);
  createdEmails.push(email);
  const account = await createAccount({ role: "candidate", fullName: "Ali Raza", email });
  return { account, email, cookies: await sessionCookies(browser, email) };
}

test("changing the name to Sara Khan shows Name updated and the new name appears in the menu", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/settings");
  await page.getByLabel("Full name").fill("Sara Khan");
  await page.getByRole("button", { name: "Save name" }).click();
  await expect(page.getByText("Name updated")).toBeVisible();
  await expect(page.getByRole("complementary").getByText("Sara Khan")).toBeVisible();
  expect((await getProfile(sara.id)).full_name).toBe("Sara Khan");
});

test("Sara (HR) sees a link to Company Settings and no Delete account section", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/settings");
  await expect(page.getByRole("link", { name: "Company settings" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete account" })).toHaveCount(0);
});

test("a new email is checked, and only changes after the confirmation link is clicked", async ({ page, browser }) => {
  const ali = await newCandidate(browser, "ali-email");
  await openWithSession(page, ali.cookies, "/settings");
  await page.getByLabel("New email").fill("not-an-email");
  await page.getByRole("button", { name: "Send confirmation link" }).click();
  await expect(page.getByText("Please enter a valid email")).toBeVisible();

  await page.getByLabel("New email").fill(sara.email);
  await page.getByRole("button", { name: "Send confirmation link" }).click();
  await expect(page.getByText("Email already in use")).toBeVisible();

  // The change is requested: until the link is clicked, the old email still works.
  const newEmail = testEmail("ali-new-address");
  createdEmails.push(newEmail);
  const link = await emailChangeLink(ali.email, newEmail);
  await openWithSession(page, ali.cookies, "/settings");
  await expect(page.getByText("Check your new email to confirm the change")).toBeVisible();
  expect((await getProfile(ali.account.id)).email).toBe(ali.email);
  const fresh = await browser.newPage();
  await logIn(fresh, ali.email);
  await fresh.close();

  // After the link: the email changes and the profile follows.
  await openEmailLink(link);
  await openWithSession(page, ali.cookies, "/settings");
  await expect(page.getByText("Email updated")).toBeVisible();
  await expect(page.getByText(newEmail)).toBeVisible();
  expect((await getProfile(ali.account.id)).email).toBe(newEmail);
});

test("password changes need the current password and follow the password rule", async ({ page, browser }) => {
  const ali = await newCandidate(browser, "ali-password");
  await openWithSession(page, ali.cookies, "/settings");

  await page.getByLabel("Current password").fill("Wrong-password1!");
  await page.getByLabel("New password", { exact: true }).fill("Newpass2026#");
  await page.getByLabel("Confirm new password").fill("Newpass2026#");
  await page.getByRole("button", { name: "Save password" }).click();
  await expect(page.getByText("Current password is incorrect")).toBeVisible();

  await page.getByLabel("Current password").fill(TEST_PASSWORD);
  await page.getByLabel("New password", { exact: true }).fill("abctech2026");
  const rules = page.getByRole("list", { name: "Password requirements" });
  await expect(rules.getByRole("listitem").filter({ hasText: "At least 8 characters" })).toHaveAttribute("data-met", "true");
  await expect(rules.getByRole("listitem").filter({ hasText: "One capital letter" })).toHaveAttribute("data-met", "false");
  await page.getByRole("button", { name: "Save password" }).click();
  await expect(page.getByText(PASSWORD_ERROR)).toBeVisible();

  await page.getByLabel("New password", { exact: true }).fill("Newpass2026#");
  await page.getByLabel("Confirm new password").fill("Newpass2026#");
  await page.getByRole("button", { name: "Save password" }).click();
  await expect(page.getByText("Password updated")).toBeVisible();

  const fresh = await browser.newPage();
  await logIn(fresh, ali.email, "Newpass2026#");
  await fresh.close();
});

test("Delete account stays disabled until DELETE is typed; a failure shows a friendly message", async ({ page, browser }) => {
  const ali = await newCandidate(browser, "ali-delete-fail");
  await openWithSession(page, ali.cookies, "/settings");
  const button = page.getByRole("button", { name: "Delete account" });
  await expect(button).toBeDisabled();
  await page.getByLabel("Type DELETE to confirm").fill("delete");
  await expect(button).toBeDisabled();
  await page.getByLabel("Type DELETE to confirm").fill("DELETE");
  await expect(button).toBeEnabled();

  await page.route("**/settings**", (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
  await button.click();
  await expect(page.getByText("Couldn't delete your account, try again")).toBeVisible();
  expect(await getProfile(ali.account.id)).toBeTruthy();
});

test("deleting logs Ali out and removes his CV, application and other data", async ({ page, browser }) => {
  const ali = await newCandidate(browser, "ali-delete");
  const job = await createJob(sara.companyId, { title: "Junior Web Developer" });
  const application = await createApplication({ job, candidate: { ...ali.account, fullName: "Ali Raza" }, cvText: makePdf() });
  expect(await cvExists(application.cv_file_path)).toBe(true);

  await openWithSession(page, ali.cookies, "/settings");
  await page.getByLabel("Type DELETE to confirm").fill("DELETE");
  await page.getByRole("button", { name: "Delete account" }).click();
  await expect(page.getByText("Your account has been deleted")).toBeVisible();

  expect(await getProfile(ali.account.id)).toBeNull();
  expect(await findApplications(ali.account.id)).toHaveLength(0);
  expect(await cvExists(application.cv_file_path)).toBe(false);

  // Logged out: My Applications asks to log in again.
  await page.goto("/my-applications");
  await expect(page).toHaveURL(/\/login/);

  // Sara no longer sees him in her candidates list.
  await openWithSession(page, saraCookies, `/hr/candidates?job=${job.id}`);
  await expect(page.getByText("No one has applied yet. Share your job link")).toBeVisible();
});
