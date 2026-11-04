import { test, expect } from "@playwright/test";
import { testEmail, createAccount, createJob, getJob, pakistanDate, deleteAccounts } from "./helpers/test-accounts";
import { sessionCookies, useSession } from "./helpers/session";
import { formatShortDate } from "../../lib/jobs/dates.js";

// Feature 04 · Close, Reopen and Deadline. Uses dummy accounts that are deleted after the run.

const CLOSED_MESSAGE = "This job is no longer accepting applications";
const createdEmails = [];
let sara;
let saraCookies;

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
  const email = testEmail("sara-close");
  createdEmails.push(email);
  sara = await createAccount({ role: "hr", fullName: "Sara", email, companyName: "ABC Tech" });
  saraCookies = await sessionCookies(browser, email);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

function jobRow(page, title) {
  return page.getByRole("row").filter({ hasText: title });
}

test("closing a job (after confirming) makes the public page show it no longer accepts applications", async ({ page, browser }) => {
  const job = await createJob(sara.companyId, { title: "Close Me Developer" });
  await useSession(page, saraCookies, "/hr/jobs");

  await jobRow(page, job.title).getByRole("button", { name: "Close job" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(`Close ${job.title}?`)).toBeVisible();
  await dialog.getByRole("button", { name: "Close job" }).click();

  await expect(page.getByText("Job closed")).toBeVisible();
  await expect(jobRow(page, job.title).getByText("Closed", { exact: true })).toBeVisible();
  expect((await getJob(job.id)).closed_reason).toBe("manual");

  const visitor = await browser.newPage();
  await visitor.goto(`/jobs/${job.slug}`);
  await expect(visitor.getByText(CLOSED_MESSAGE)).toBeVisible();
  await expect(visitor.getByRole("link", { name: "Apply now" })).toHaveCount(0);
  await visitor.close();
});

test("reopening a closed job brings back the Apply button", async ({ page, browser }) => {
  const job = await createJob(sara.companyId, {
    title: "Reopen Me Developer",
    status: "closed",
    closed_reason: "manual",
    closed_at: new Date().toISOString(),
  });
  await useSession(page, saraCookies, "/hr/jobs");

  await jobRow(page, job.title).getByRole("button", { name: "Reopen" }).click();
  await expect(page.getByText("Job reopened")).toBeVisible();
  await expect(jobRow(page, job.title).getByText("Open", { exact: true })).toBeVisible();

  const visitor = await browser.newPage();
  await visitor.goto(`/jobs/${job.slug}`);
  await expect(visitor.getByRole("link", { name: "Apply now" })).toBeVisible();
  await visitor.close();
});

test("a job read after its Apply by day closes, shows Applications closed on, and Sara sees Deadline passed", async ({ page, browser }) => {
  const yesterday = pakistanDate(-1);
  const job = await createJob(sara.companyId, { title: "Late Developer", apply_by: yesterday });

  // A logged-out visitor opens the link: the server closes the job.
  const visitor = await browser.newPage();
  await visitor.goto(`/jobs/${job.slug}`);
  await expect(visitor.getByText(`Applications closed on ${formatShortDate(yesterday, pakistanDate(0))}`)).toBeVisible();
  await expect(visitor.getByRole("link", { name: "Apply now" })).toHaveCount(0);
  await visitor.close();

  const saved = await getJob(job.id);
  expect(saved.status).toBe("closed");
  expect(saved.closed_reason).toBe("deadline");

  await useSession(page, saraCookies, "/hr/jobs");
  await expect(jobRow(page, job.title).getByText("Closed · Deadline passed")).toBeVisible();
});

test("HR pages close past-deadline jobs too", async ({ page }) => {
  const job = await createJob(sara.companyId, { title: "Expired On Dashboard", apply_by: pakistanDate(-2) });
  await useSession(page, saraCookies, "/hr/dashboard");
  const card = page.getByRole("article").filter({ hasText: job.title });
  await expect(card.getByText("Closed · Deadline passed")).toBeVisible();
  expect((await getJob(job.id)).closed_reason).toBe("deadline");
});

test("reopening a deadline-closed job needs a new date, and a future date reopens it", async ({ page, browser }) => {
  const job = await createJob(sara.companyId, {
    title: "Extend Me Developer",
    status: "closed",
    closed_reason: "deadline",
    closed_at: new Date().toISOString(),
    apply_by: pakistanDate(-3),
  });
  await useSession(page, saraCookies, "/hr/jobs");

  await jobRow(page, job.title).getByRole("button", { name: "Reopen" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Reopen job" }).click();
  await expect(dialog.getByText("Set a new Apply by date to reopen this job")).toBeVisible();
  expect((await getJob(job.id)).status).toBe("closed");

  await dialog.getByLabel("New Apply by date").fill(pakistanDate(-1));
  await dialog.getByRole("button", { name: "Reopen job" }).click();
  await expect(dialog.getByText("Apply by date can't be in the past")).toBeVisible();

  const newDate = pakistanDate(10);
  await dialog.getByLabel("New Apply by date").fill(newDate);
  await dialog.getByRole("button", { name: "Reopen job" }).click();
  await expect(page.getByText("Deadline extended. The job is open again")).toBeVisible();

  const saved = await getJob(job.id);
  expect(saved.status).toBe("open");
  expect(saved.apply_by).toBe(newDate);
  expect(saved.closed_reason).toBeNull();

  const visitor = await browser.newPage();
  await visitor.goto(`/jobs/${job.slug}`);
  await expect(visitor.getByRole("link", { name: "Apply now" })).toBeVisible();
  await visitor.close();
});
