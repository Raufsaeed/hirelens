import { test, expect } from "@playwright/test";
import { testEmail, createAccount, createJob, findJob, updateJob, deleteJobAs, deleteAccounts } from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";

// Feature 02 · Delete draft jobs. HR can delete only their own company's drafts;
// open and closed jobs can never be deleted. Uses dummy accounts that are deleted after the run.

const createdEmails = [];
let sara;
let saraCookies;
let omar; // HR of another company

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-delete");
  const omarEmail = testEmail("omar-delete");
  createdEmails.push(saraEmail, omarEmail);
  sara = await createAccount({ role: "hr", fullName: "Sara", email: saraEmail, companyName: "ABC Tech" });
  omar = await createAccount({ role: "hr", fullName: "Omar", email: omarEmail, companyName: "XYZ Soft" });
  saraCookies = await sessionCookies(browser, saraEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

function jobRow(page, title) {
  return page.getByRole("row").filter({ hasText: title });
}

function draft(title) {
  return createJob(sara.companyId, { title, status: "draft", slug: null });
}

test("Sara deletes a draft after confirming: the toast shows and the row goes", async ({ page }) => {
  const job = await draft("Draft To Delete");
  await openWithSession(page, saraCookies, "/hr/jobs");

  await jobRow(page, job.title).getByRole("button", { name: "Delete draft" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog.getByText("Delete this draft?")).toBeVisible();
  await expect(dialog.getByText("This can't be undone.")).toBeVisible();

  // Cancel keeps the draft.
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  expect(await findJob(job.id)).not.toBeNull();

  await jobRow(page, job.title).getByRole("button", { name: "Delete draft" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete", exact: true }).click();

  await expect(page.getByText("Draft deleted")).toBeVisible();
  await expect(jobRow(page, job.title)).toHaveCount(0);
  expect(await findJob(job.id)).toBeNull();
});

test("open and closed jobs have no Delete action and can't be deleted", async ({ page }) => {
  const open = await createJob(sara.companyId, { title: "Open Stays Developer" });
  const closed = await createJob(sara.companyId, {
    title: "Closed Stays Developer",
    status: "closed",
    closed_reason: "manual",
    closed_at: new Date().toISOString(),
  });
  await openWithSession(page, saraCookies, "/hr/jobs");

  await expect(jobRow(page, open.title)).toHaveCount(1);
  await expect(jobRow(page, open.title).getByRole("button", { name: "Delete draft" })).toHaveCount(0);
  await expect(jobRow(page, closed.title).getByRole("button", { name: "Delete draft" })).toHaveCount(0);

  // Even straight to the database, Row Level Security blocks it.
  expect(await deleteJobAs(sara.email, open.id)).toEqual([]);
  expect(await deleteJobAs(sara.email, closed.id)).toEqual([]);
  expect(await findJob(open.id)).not.toBeNull();
  expect(await findJob(closed.id)).not.toBeNull();
});

test("a draft published meanwhile shows Only draft jobs can be deleted and is kept", async ({ page }) => {
  const job = await draft("Published Meanwhile Developer");
  await openWithSession(page, saraCookies, "/hr/jobs");
  await updateJob(job.id, { status: "open", slug: `e2e-published-meanwhile-${Date.now()}` });

  await jobRow(page, job.title).getByRole("button", { name: "Delete draft" }).click();
  const dialog = page.getByRole("alertdialog");
  await dialog.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(dialog.getByText("Only draft jobs can be deleted")).toBeVisible();
  expect((await findJob(job.id)).status).toBe("open");
});

test("another company's HR can't see or delete Sara's draft", async ({ page, browser }) => {
  const job = await draft("Private Draft Developer");

  const omarCookies = await sessionCookies(browser, omar.email);
  await openWithSession(page, omarCookies, "/hr/jobs");
  await expect(page.getByRole("heading", { name: "My Jobs" })).toBeVisible();
  await expect(jobRow(page, job.title)).toHaveCount(0);

  expect(await deleteJobAs(omar.email, job.id)).toEqual([]);
  expect(await findJob(job.id)).not.toBeNull();
});
