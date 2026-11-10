import { test, expect } from "@playwright/test";
import {
  TEST_PASSWORD,
  testEmail,
  createAccount,
  createJob,
  updateJob,
  findApplications,
  cvExists,
  pakistanDate,
  deleteAccounts,
} from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";
import { bigPdfFile, docxFile, pdfFile } from "./helpers/files";
import { formatShortDate } from "../../lib/jobs/dates.js";

// Feature 08 · Apply with CV. Uses dummy accounts, jobs and CVs that are deleted after the run.

const createdEmails = [];
let sara;
let ali;
let aliCookies;
let job;

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-apply");
  const aliEmail = testEmail("ali-apply");
  createdEmails.push(saraEmail, aliEmail);
  sara = await createAccount({ role: "hr", fullName: "Sara", email: saraEmail, companyName: "ABC Tech" });
  ali = await createAccount({ role: "candidate", fullName: "Ali Raza", email: aliEmail });
  ali.fullName = "Ali Raza";
  aliCookies = await sessionCookies(browser, aliEmail);
  job = await createJob(sara.companyId, { title: "Junior Web Developer", apply_by: pakistanDate(5) });
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

function cvInput(page) {
  return page.locator('input[type="file"]');
}

async function openApplyForm(page, theJob = job) {
  await openWithSession(page, aliCookies, `/jobs/${theJob.slug}`);
  await page.getByRole("link", { name: "Apply now" }).click();
  await expect(page).toHaveURL(new RegExp(`/jobs/${theJob.slug}/apply$`));
  await expect(page.getByRole("heading", { name: "Apply to ABC Tech" })).toBeVisible();
}

test("a logged-out visitor who clicks Apply signs up and comes back to the apply form", async ({ page }) => {
  const email = testEmail("ali-new");
  createdEmails.push(email);
  await page.goto(`/jobs/${job.slug}`);
  await page.getByRole("link", { name: "Apply now" }).click();
  await expect(page).toHaveURL(/\/signup\?.*role=candidate/);

  await page.getByLabel("Full name").fill("New Candidate");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(new RegExp(`/jobs/${job.slug}/apply$`));
  await expect(page.getByLabel("Full name")).toHaveValue("New Candidate");
});

test("a .docx file shows Only PDF files are accepted and Submit stays disabled", async ({ page }) => {
  await openApplyForm(page);
  await expect(page.getByLabel("Full name")).toHaveValue("Ali Raza");
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(ali.email);

  await cvInput(page).setInputFiles(docxFile());
  await expect(page.getByText("Only PDF files are accepted")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit application" })).toBeDisabled();
});

test("a 7 MB PDF shows File must be under 5 MB and is not uploaded", async ({ page }) => {
  await openApplyForm(page);
  await cvInput(page).setInputFiles(bigPdfFile());
  await expect(page.getByText("File must be under 5 MB")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit application" })).toBeDisabled();
  expect(await findApplications(ali.id)).toHaveLength(0);
});

test("empty phone and a long cover note are explained, and nothing is saved", async ({ page }) => {
  await openApplyForm(page);
  await cvInput(page).setInputFiles(pdfFile());
  await page.getByLabel(/Cover note/).fill("x".repeat(501));
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("This field is required")).toBeVisible();
  await expect(page.getByText("Cover note can be up to 500 characters")).toBeVisible();
  expect(await findApplications(ali.id)).toHaveLength(0);
});

test("Ali applies with a PDF CV and sees Your application has been sent to ABC Tech", async ({ page }) => {
  await openApplyForm(page);
  await page.getByLabel("Phone").fill("0300 1234567");
  await page.getByLabel(/Cover note/).fill("I build React apps and would love to join ABC Tech.");
  await cvInput(page).setInputFiles(pdfFile("ali-cv.pdf"));
  await expect(page.getByText("ali-cv.pdf")).toBeVisible();
  await page.getByRole("button", { name: "Submit application" }).click();

  await expect(page.getByRole("heading", { name: "Your application has been sent to ABC Tech" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to My Applications" })).toBeVisible();

  const [application] = await findApplications(ali.id);
  expect(application.job_id).toBe(job.id);
  expect(application.status).toBe("applied");
  // AI screening (Feature 11) starts in the background straight away.
  // (Not "failed": that would mean the PDF couldn't be read.)
  expect(["queued", "processing", "done", "pending"]).toContain(application.screening_status);
  expect(application.candidate_name).toBe("Ali Raza");
  expect(application.candidate_email).toBe(ali.email);
  expect(application.cover_note).toContain("React apps");
  expect(application.cv_file_path).toBe(`${ali.id}/applications/${job.id}/ali-cv.pdf`);
  expect(await cvExists(application.cv_file_path)).toBe(true);

  // The first history entry goes from empty to Applied.
  expect(application.status_history).toHaveLength(1);
  expect(application.status_history[0].from_status).toBeNull();
  expect(application.status_history[0].to_status).toBe("applied");
});

test("applying twice shows You have already applied to this job", async ({ page }) => {
  // The job page now shows the applied banner instead of Apply now (show applied status)...
  await openWithSession(page, aliCookies, `/jobs/${job.slug}`);
  await expect(page.getByText("You already applied to this job")).toBeVisible();
  await expect(page.getByRole("link", { name: "Apply now" })).toHaveCount(0);
  // ...and the apply form, opened from an old link, still refuses a second application.
  await openWithSession(page, aliCookies, `/jobs/${job.slug}/apply`);
  await expect(page.getByText("You have already applied to this job")).toBeVisible();
  await expect(page.getByRole("link", { name: "My Applications" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit application" })).toHaveCount(0);
  expect(await findApplications(ali.id)).toHaveLength(1);
});

test("submitting after the deadline shows Applications for this job closed on", async ({ page }) => {
  const lateJob = await createJob(sara.companyId, { title: "Frontend Intern", apply_by: pakistanDate(0) });
  await openApplyForm(page, lateJob);
  await page.getByLabel("Phone").fill("0300 1234567");
  await cvInput(page).setInputFiles(pdfFile());

  // The deadline passes while Ali has the form open.
  const yesterday = pakistanDate(-1);
  await updateJob(lateJob.id, { apply_by: yesterday });
  await page.getByRole("button", { name: "Submit application" }).click();

  await expect(page.getByText(`Applications for this job closed on ${formatShortDate(yesterday, pakistanDate(0))}`)).toBeVisible();
  const applications = await findApplications(ali.id);
  expect(applications.filter((application) => application.job_id === lateJob.id)).toHaveLength(0);
});

test("a closed job's apply page says it is no longer accepting applications", async ({ page }) => {
  const closedJob = await createJob(sara.companyId, {
    title: "Closed Role",
    status: "closed",
    closed_reason: "manual",
    closed_at: new Date().toISOString(),
  });
  await openWithSession(page, aliCookies, `/jobs/${closedJob.slug}/apply`);
  await expect(page.getByText("This job is no longer accepting applications")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit application" })).toHaveCount(0);
});
