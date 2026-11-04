import { test, expect } from "@playwright/test";
import { testEmail, createAccount, createJob, createApplication, setScreening, deleteAccounts } from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";

// Feature 13 · Candidate Search. Screenings are saved directly (no AI). Dummy data is deleted after.

test.describe.configure({ mode: "serial" });

const TAG = `q${Date.now().toString(36)}`;
const createdEmails = [];
let saraCookies;
let webJob;
let aliWebApplication;

async function applicant(job, fullName, score, status = "applied") {
  const email = testEmail(fullName.split(" ")[0].toLowerCase());
  createdEmails.push(email);
  const account = await createAccount({ role: "candidate", fullName, email });
  const application = await createApplication({ job, candidate: { ...account, fullName }, status });
  await setScreening(application.id, { score, match_percent: 60, relevant_years: 1, requirements_result: [] });
  return { account, application };
}

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-search");
  const otherEmail = testEmail("other-search");
  createdEmails.push(saraEmail, otherEmail);
  const sara = await createAccount({ role: "hr", fullName: "Sara", email: saraEmail, companyName: "ABC Tech" });
  const other = await createAccount({ role: "hr", fullName: "Omar", email: otherEmail, companyName: "XYZ Labs" });

  webJob = await createJob(sara.companyId, { title: "Junior Web Developer" });
  const qaJob = await createJob(sara.companyId, { title: "QA Intern" });
  const xyzJob = await createJob(other.companyId, { title: "XYZ Designer" });

  // Ali applied to two ABC Tech jobs with one account.
  const aliEmail = testEmail("ali");
  createdEmails.push(aliEmail);
  const ali = await createAccount({ role: "candidate", fullName: `Ali ${TAG}`, email: aliEmail });
  aliWebApplication = await createApplication({ job: webJob, candidate: { ...ali, fullName: `Ali ${TAG}` } });
  await setScreening(aliWebApplication.id, { score: 74, match_percent: 80, relevant_years: 1.3, requirements_result: [] });
  const aliQa = await createApplication({ job: qaJob, candidate: { ...ali, fullName: `Ali ${TAG}` }, status: "shortlisted" });
  await setScreening(aliQa.id, { score: 66, match_percent: 50, relevant_years: 1.3, requirements_result: [] });

  await applicant(webJob, `Usman ${TAG}`, 61);
  await applicant(xyzJob, `Bilal ${TAG}`, 90);

  saraCookies = await sessionCookies(browser, saraEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

function topSearch(page) {
  return page.getByRole("search").getByLabel("Search candidates");
}

test("typing ali in the top navigation shows Ali once with both jobs, scores and statuses", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/dashboard");
  await topSearch(page).fill(`ali ${TAG}`);

  const results = page.getByRole("list", { name: "Search results" });
  const ali = results.getByRole("listitem").filter({ hasText: `Ali ${TAG}` });
  await expect(ali).toHaveCount(1);
  await expect(ali.getByText("Junior Web Developer")).toBeVisible();
  await expect(ali.getByText("QA Intern")).toBeVisible();
  await expect(ali.getByText("74")).toBeVisible();
  await expect(ali.getByText("66")).toBeVisible();
  await expect(ali.getByText("Shortlisted")).toBeVisible();

  // Clicking a result opens that Candidate Detail page.
  await ali.getByRole("link", { name: /Junior Web Developer/ }).click();
  await expect(page).toHaveURL(new RegExp(`/hr/candidates/${aliWebApplication.id}$`));
  await expect(page.getByRole("heading", { level: 1, name: `Ali ${TAG}` })).toBeVisible();
});

test("typing fewer than 2 characters shows Type at least 2 characters", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/dashboard");
  await topSearch(page).fill("a");
  await expect(page.getByText("Type at least 2 characters")).toBeVisible();
});

test("with the minimum score at 70, searching usman shows No candidates found for 'usman'", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/candidates?job=${webJob.id}`);
  await page.getByLabel("Minimum score").fill("70");
  await page.getByLabel("Search this list").fill("usman");
  await expect(page.getByText("No candidates found for 'usman'")).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.getByRole("row").filter({ hasText: `Ali ${TAG}` })).toBeVisible();
});

test("Privacy: searching bilal (another company's candidate) shows No candidates found", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/dashboard");
  await topSearch(page).fill(`bilal ${TAG}`);
  await expect(page.getByText(`No candidates found for 'bilal ${TAG}'`)).toBeVisible();
});
