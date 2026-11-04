import { test, expect } from "@playwright/test";
import { testEmail, createAccount, createJob, pakistanDate, deleteAccounts } from "./helpers/test-accounts";
import { formatShortDate } from "../../lib/jobs/dates.js";

// Feature 07 · Job Search. Public pages, so no login is needed. A unique tag in every title
// keeps these jobs apart from any other jobs in the database.

const TAG = `Zq${Date.now().toString(36)}`;
const createdEmails = [];
let company;
let openJob;
let internJob;
let draftJob;
let closedJob;
let lateJob;

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  const email = testEmail("sara-search");
  createdEmails.push(email);
  company = await createAccount({ role: "hr", fullName: "Sara", email, companyName: `ABC Tech ${TAG}` });
  openJob = await createJob(company.companyId, { title: `${TAG} Junior Web Developer`, apply_by: pakistanDate(3) });
  internJob = await createJob(company.companyId, {
    title: `${TAG} QA Intern`,
    job_type: "internship",
    location: "Karachi",
  });
  draftJob = await createJob(company.companyId, { title: `${TAG} Draft Designer`, status: "draft", slug: null });
  closedJob = await createJob(company.companyId, {
    title: `${TAG} Closed Analyst`,
    status: "closed",
    closed_reason: "manual",
    closed_at: new Date().toISOString(),
  });
  lateJob = await createJob(company.companyId, { title: `${TAG} Late Engineer`, apply_by: pakistanDate(-1) });
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

function card(page, title) {
  return page.getByRole("article").filter({ hasText: title });
}

test("the Public Jobs List shows only Open jobs, with search, job type and location filters", async ({ page }) => {
  await page.goto(`/jobs?q=${TAG}`);
  await expect(card(page, openJob.title)).toBeVisible();
  await expect(card(page, internJob.title)).toBeVisible();
  await expect(card(page, draftJob.title)).toHaveCount(0);
  await expect(card(page, closedJob.title)).toHaveCount(0);
  // Past its deadline: the list's deadline check closes it, so it is not listed.
  await expect(card(page, lateJob.title)).toHaveCount(0);
  await expect(card(page, openJob.title).getByText(`ABC Tech ${TAG}`)).toBeVisible();

  // Search by company name finds the company's open jobs.
  await page.getByLabel("Search jobs").fill(`ABC Tech ${TAG}`);
  await page.getByRole("button", { name: "Search" }).click();
  await expect(card(page, openJob.title)).toBeVisible();

  await page.getByLabel("Search jobs").fill(TAG);
  await page.getByLabel("Job type").selectOption({ label: "Internship" });
  await page.getByRole("button", { name: "Search" }).click();
  await expect(card(page, internJob.title)).toBeVisible();
  await expect(card(page, openJob.title)).toHaveCount(0);

  await page.getByLabel("Job type").selectOption({ label: "Any type" });
  await page.getByLabel("Location").fill("Karachi");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(card(page, internJob.title)).toBeVisible();
  await expect(card(page, openJob.title)).toHaveCount(0);
});

test("a search with no matches shows No jobs match your search with Clear filters", async ({ page }) => {
  await page.goto(`/jobs?q=xyz${TAG}`);
  await expect(page.getByText("No jobs match your search")).toBeVisible();
  await page.getByRole("link", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(/\/jobs$/);
});

test("a job page shows the details, Apply by · 3 days left and an Apply button", async ({ page }) => {
  await page.goto(`/jobs?q=${TAG}`);
  await card(page, openJob.title).getByRole("link", { name: openJob.title }).click();
  await expect(page).toHaveURL(new RegExp(`/jobs/${openJob.slug}$`));

  await expect(page.getByRole("heading", { level: 1, name: openJob.title })).toBeVisible();
  await expect(page.getByText(`ABC Tech ${TAG}`).first()).toBeVisible();
  for (const text of ["Lahore", "Full-time", "1 year", "BS Computer Science", "HTML", "React", "REST APIs"]) {
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  }
  await expect(page.getByText(openJob.description).filter({ visible: true })).toBeVisible();
  const shortDate = formatShortDate(pakistanDate(3), pakistanDate(0));
  await expect(page.getByText(`Apply by ${shortDate} · 3 days left`).filter({ visible: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Apply now" })).toBeVisible();
});

test("a job past its deadline shows Applications closed on instead of Apply", async ({ page }) => {
  await page.goto(`/jobs/${lateJob.slug}`);
  const shortDate = formatShortDate(pakistanDate(-1), pakistanDate(0));
  await expect(page.getByText(`Applications closed on ${shortDate}`).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Apply now" })).toHaveCount(0);
});

test("a draft or unknown job link shows This job could not be found", async ({ page }) => {
  await page.goto(`/jobs/${draftJob.title.toLowerCase().replace(/\s+/g, "-")}`);
  await expect(page.getByText("This job could not be found")).toBeVisible();
  await page.goto("/jobs/no-such-job-anywhere");
  await expect(page.getByText("This job could not be found")).toBeVisible();
  await expect(page.getByRole("link", { name: "Apply now" })).toHaveCount(0);
});

test("public job pages have no horizontal scroll at 360px and never show applicant counts", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of [`/jobs?q=${TAG}`, `/jobs/${openJob.slug}`]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
    await expect(page.getByText(/applicants?/i)).toHaveCount(0);
  }
});
