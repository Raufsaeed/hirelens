import { test, expect } from "@playwright/test";
import { testEmail, createAccount, createJob, findJob, deleteJobAs, deleteAccounts } from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";

// Feature 02 · Delete draft jobs. HR can delete only their own company's drafts here; deleting
// open and closed jobs with no applicants is tested in 15-final-statuses-and-job-delete.spec.js.
// Uses dummy accounts that are deleted after the run.

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

test("another company's HR can't see or delete Sara's draft", async ({ page, browser }) => {
  const job = await draft("Private Draft Developer");

  const omarCookies = await sessionCookies(browser, omar.email);
  await openWithSession(page, omarCookies, "/hr/jobs");
  await expect(page.getByRole("heading", { name: "My Jobs" })).toBeVisible();
  await expect(jobRow(page, job.title)).toHaveCount(0);

  expect(await deleteJobAs(omar.email, job.id)).toEqual([]);
  expect(await findJob(job.id)).not.toBeNull();
});
