import { test, expect } from "@playwright/test";
import {
  testEmail,
  createAccount,
  createJob,
  createApplication,
  updateJob,
  findSavedJobs,
  addSavedJob,
  readRowsAs,
  deleteAccounts,
  pakistanDate,
} from "./helpers/test-accounts";
import { sessionCookies, openWithSession, logIn } from "./helpers/session";

// Feature 21 · Saved Jobs. Dummy accounts and data are deleted after the run.

test.describe.configure({ mode: "serial" });

const createdEmails = [];
let ali;
let aliEmail;
let aliCookies;
let saraEmail;
let saraCookies;
let webJob;
let listJob;
let closingJob;
let pastJob;
let appliedJob;

test.beforeAll(async ({ browser }) => {
  saraEmail = testEmail("sara-saved");
  aliEmail = testEmail("ali-saved");
  createdEmails.push(saraEmail, aliEmail);
  const sara = await createAccount({ role: "hr", fullName: "Sara Khan", email: saraEmail, companyName: "ABC Tech" });
  ali = await createAccount({ role: "candidate", fullName: "Ali Raza", email: aliEmail });
  const tag = Date.now();
  webJob = await createJob(sara.companyId, { title: `Junior Web Developer ${tag}`, apply_by: pakistanDate(10) });
  listJob = await createJob(sara.companyId, { title: `Saved List Tester ${tag}`, apply_by: pakistanDate(10) });
  closingJob = await createJob(sara.companyId, { title: `Closing Soon Role ${tag}`, apply_by: pakistanDate(10) });
  pastJob = await createJob(sara.companyId, { title: `Past Deadline Role ${tag}`, apply_by: pakistanDate(3) });
  appliedJob = await createJob(sara.companyId, { title: `Already Applied Role ${tag}`, apply_by: pakistanDate(10) });
  await createApplication({ job: appliedJob, candidate: { ...ali, fullName: "Ali Raza" } });
  aliCookies = await sessionCookies(browser, aliEmail);
  saraCookies = await sessionCookies(browser, saraEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

const savedCard = (page, job) => page.getByRole("listitem").filter({ hasText: job.title });

test("Ali saves a job on its page; it shows Saved and appears on Saved Jobs with Apply", async ({ page }) => {
  await openWithSession(page, aliCookies, `/jobs/${webJob.slug}`);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Job saved")).toBeVisible();
  await expect(page.getByRole("button", { name: "Saved", exact: true })).toBeVisible();
  expect(await findSavedJobs(ali.id)).toHaveLength(1);

  await page.getByRole("link", { name: "Saved Jobs" }).first().click();
  await expect(page).toHaveURL(/\/saved-jobs$/);
  await expect(savedCard(page, webJob).getByRole("link", { name: "Apply" })).toBeVisible();
});

test("Ali saves and unsaves a job from the jobs list", async ({ page }) => {
  await openWithSession(page, aliCookies, `/jobs?q=${encodeURIComponent(listJob.title)}`);
  const card = page.getByRole("article").filter({ hasText: listJob.title });
  await card.getByRole("button", { name: "Save", exact: true }).click();
  await expect(card.getByRole("button", { name: "Saved", exact: true })).toBeVisible();
  await card.getByRole("button", { name: "Saved", exact: true }).click();
  await expect(page.getByText("Removed from saved jobs")).toBeVisible();
  await expect(card.getByRole("button", { name: "Save", exact: true })).toBeVisible();
  expect((await findSavedJobs(ali.id)).some((row) => row.job_id === listJob.id)).toBe(false);
});

test("a logged-out visitor who clicks Save logs in and is back on the job with it saved", async ({ page }) => {
  // A second candidate, so this test logs in through the real form.
  const bilalEmail = testEmail("bilal-saved");
  createdEmails.push(bilalEmail);
  const bilal = await createAccount({ role: "candidate", fullName: "Bilal Shah", email: bilalEmail });

  await page.context().clearCookies();
  await page.goto(`/jobs/${webJob.slug}`);
  await page.getByRole("link", { name: "Save", exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText("Log in to save jobs")).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill(bilalEmail);
  await page.getByLabel("Password", { exact: true }).fill("Abctech2026@");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(new RegExp(`/jobs/${webJob.slug}$`));
  await expect(page.getByRole("button", { name: "Saved", exact: true })).toBeVisible();
  expect((await findSavedJobs(bilal.id)).map((row) => row.job_id)).toEqual([webJob.id]);
});

test("a saved job that Sara closed shows Applications closed", async ({ page }) => {
  await addSavedJob(ali.id, closingJob.id);
  await updateJob(closingJob.id, { status: "closed", closed_reason: "manual", closed_at: new Date().toISOString() });
  await openWithSession(page, aliCookies, "/saved-jobs");
  await expect(savedCard(page, closingJob).getByText("Applications closed")).toBeVisible();
  await expect(savedCard(page, closingJob).getByRole("link", { name: "Apply" })).toHaveCount(0);
});

test("a saved job past its Apply by date shows Applications closed", async ({ page }) => {
  await addSavedJob(ali.id, pastJob.id);
  await updateJob(pastJob.id, { apply_by: pakistanDate(-1) });
  await openWithSession(page, aliCookies, "/saved-jobs");
  await expect(savedCard(page, pastJob).getByText("Applications closed")).toBeVisible();
});

test("a saved job Ali applied to shows Applied", async ({ page }) => {
  await addSavedJob(ali.id, appliedJob.id);
  await openWithSession(page, aliCookies, "/saved-jobs");
  await expect(savedCard(page, appliedJob).getByText("Applied", { exact: true })).toBeVisible();
  await expect(savedCard(page, appliedJob).getByRole("link", { name: "Apply" })).toHaveCount(0);
});

test("Remove takes the job off the list, and the job page shows Save again", async ({ page }) => {
  await openWithSession(page, aliCookies, "/saved-jobs");
  await savedCard(page, webJob).getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Removed from saved jobs")).toBeVisible();
  await expect(savedCard(page, webJob)).toHaveCount(0);

  await openWithSession(page, aliCookies, `/jobs/${webJob.slug}`);
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeVisible();
});

test("an empty Saved Jobs page says You haven't saved any jobs yet", async ({ page }) => {
  const nadiaEmail = testEmail("nadia-saved");
  createdEmails.push(nadiaEmail);
  await createAccount({ role: "candidate", fullName: "Nadia", email: nadiaEmail });
  await page.context().clearCookies();
  await logIn(page, nadiaEmail);
  await page.goto("/saved-jobs");
  await expect(page.getByText("You haven't saved any jobs yet")).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse jobs" })).toBeVisible();
});

test("privacy: HR never sees who saved a job and has no Save button", async ({ page }) => {
  await openWithSession(page, saraCookies, `/jobs/${appliedJob.slug}`);
  await expect(page.getByRole("button", { name: "Save", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Save", exact: true })).toHaveCount(0);
  expect(await readRowsAs(saraEmail, "saved_jobs", "job_id", appliedJob.id)).toHaveLength(0);
});
