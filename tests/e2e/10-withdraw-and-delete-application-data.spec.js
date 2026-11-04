import { test, expect } from "@playwright/test";
import {
  testEmail,
  createAccount,
  createJob,
  createApplication,
  findApplications,
  cvExists,
  deleteAccounts,
} from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";
import { makePdf } from "./helpers/files";

// Feature 10 · Withdraw and Delete Application Data. Uses dummy data deleted after the run.
// (Sara's greyed-out pipeline card is checked with Feature 15.)

const createdEmails = [];
let sara;
let ali;
let aliCookies;

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-withdraw");
  const aliEmail = testEmail("ali-withdraw");
  createdEmails.push(saraEmail, aliEmail);
  sara = await createAccount({ role: "hr", fullName: "Sara", email: saraEmail, companyName: "ABC Tech" });
  ali = await createAccount({ role: "candidate", fullName: "Ali Raza", email: aliEmail });
  ali.fullName = "Ali Raza";
  aliCookies = await sessionCookies(browser, aliEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

test("withdrawing a Shortlisted application sets it to Withdrawn with Ali as changed_by", async ({ page }) => {
  const job = await createJob(sara.companyId, { title: "Junior Web Developer" });
  const application = await createApplication({ job, candidate: ali, status: "shortlisted" });

  await openWithSession(page, aliCookies, `/my-applications/${application.id}`);
  await page.getByRole("button", { name: "Withdraw" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Withdraw your application?")).toBeVisible();
  await dialog.getByRole("button", { name: "Withdraw application" }).click();

  await expect(page.getByText("Application withdrawn")).toBeVisible();
  await expect(page.getByText("Withdrawn", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Withdraw" })).toHaveCount(0);

  const saved = (await findApplications(ali.id)).find((row) => row.id === application.id);
  expect(saved.status).toBe("withdrawn");
  const change = saved.status_history.find((row) => row.to_status === "withdrawn");
  expect(change.from_status).toBe("shortlisted");
  expect(change.changed_by).toBe(ali.id);
});

test("at Interview, Withdraw is not available", async ({ page }) => {
  const job = await createJob(sara.companyId, { title: "Backend Developer" });
  const application = await createApplication({ job, candidate: ali, status: "interview" });

  await openWithSession(page, aliCookies, `/my-applications/${application.id}`);
  await expect(page.getByRole("heading", { level: 1, name: job.title })).toBeVisible();
  await expect(page.getByRole("button", { name: "Withdraw" })).toHaveCount(0);
  await expect(page.getByText("You can't withdraw at this stage")).toBeVisible();
});

test("Delete my data removes the application, its history and the CV file", async ({ page }) => {
  const job = await createJob(sara.companyId, { title: "QA Intern" });
  const application = await createApplication({ job, candidate: ali, cvText: makePdf() });
  expect(await cvExists(application.cv_file_path)).toBe(true);

  await openWithSession(page, aliCookies, `/my-applications/${application.id}`);
  await page.getByRole("button", { name: "Delete my data" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Delete your data for this application?")).toBeVisible();
  await dialog.getByRole("button", { name: "Delete my data" }).click();

  await expect(page).toHaveURL(/\/my-applications\?deleted=1$/);
  await expect(page.getByText("Your data has been deleted")).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: "QA Intern" })).toHaveCount(0);

  expect((await findApplications(ali.id)).find((row) => row.id === application.id)).toBeUndefined();
  expect(await cvExists(application.cv_file_path)).toBe(false);
});
