import { test, expect } from "@playwright/test";
import {
  testEmail,
  createAccount,
  createJob,
  createApplication,
  setScreening,
  updateApplication,
  deleteAccounts,
  pakistanDate,
} from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";

// Feature 19 · Reports. Dummy accounts and data are deleted after the run.

test.describe.configure({ mode: "serial" });

const createdEmails = [];
let saraCookies;
let emptyHrCookies;
let candidateCookies;
let webJob;
let qaJob;
// A wide date range that holds every test application (some applied a few days ago).
const RANGE = `from=${pakistanDate(-30)}&to=${pakistanDate(0)}`;

const requirements = (restFound) => [
  { name: "HTML", type: "must", found: true, evidence: "Built pages in HTML" },
  { name: "React", type: "must", found: true, evidence: "React projects" },
  { name: "REST APIs", type: "nice", found: restFound, evidence: restFound ? "Used REST APIs" : "" },
];

async function newCandidate(name) {
  const email = testEmail(name.toLowerCase().replace(/\s+/g, "-"));
  createdEmails.push(email);
  const account = await createAccount({ role: "candidate", fullName: name, email });
  return { ...account, fullName: name };
}

test.beforeAll(async ({ browser }) => {
  test.setTimeout(120 * 1000);
  const saraEmail = testEmail("sara-reports");
  createdEmails.push(saraEmail);
  const sara = await createAccount({ role: "hr", fullName: "Sara Khan", email: saraEmail, companyName: "ABC Tech" });
  webJob = await createJob(sara.companyId, { title: "Junior Web Developer" });
  qaJob = await createJob(sara.companyId, { title: "QA Intern" });

  // Junior Web Developer: 5 applicants. 2 shortlisted, 1 hired 4 days after applying, 1 screening pending.
  const plan = [
    { name: "Ali Raza", status: "shortlisted", score: 80, restFound: false },
    { name: "Hina Malik", status: "shortlisted", score: 60, restFound: false },
    { name: "Usman Tariq", status: "hired", score: 70, restFound: false },
    { name: "Zara Ahmed", status: "applied", score: 90, restFound: true },
    { name: "Bilal Shah", status: "applied", pending: true },
  ];
  for (const item of plan) {
    const candidate = await newCandidate(item.name);
    const application = await createApplication({ job: webJob, candidate, status: item.status });
    if (item.pending) {
      await setScreening(application.id, { screening_status: "pending", error_message: "AI busy" });
    } else {
      await setScreening(application.id, { score: item.score, requirements_result: requirements(item.restFound) });
    }
    if (item.status === "hired") {
      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
      await updateApplication(application.id, { applied_at: fourDaysAgo });
    }
  }

  // Another company with its own job and applicant: must never show in Sara's reports.
  const otherEmail = testEmail("other-hr-reports");
  createdEmails.push(otherEmail);
  const other = await createAccount({ role: "hr", fullName: "Omar Other", email: otherEmail, companyName: "XYZ Corp" });
  const secretJob = await createJob(other.companyId, { title: "Secret Data Analyst" });
  const outsider = await newCandidate("Outsider Person");
  const outsiderApp = await createApplication({ job: secretJob, candidate: outsider });
  await setScreening(outsiderApp.id, {
    score: 15,
    requirements_result: [{ name: "Kubernetes Secret Skill", type: "must", found: false, evidence: "" }],
  });

  // HR of a company with no jobs at all.
  const emptyEmail = testEmail("empty-hr-reports");
  createdEmails.push(emptyEmail);
  await createAccount({ role: "hr", fullName: "Nadia Empty", email: emptyEmail, companyName: "Empty Co" });

  saraCookies = await sessionCookies(browser, saraEmail);
  emptyHrCookies = await sessionCookies(browser, emptyEmail);
  candidateCookies = await sessionCookies(browser, createdEmails[1]);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

// Opens a chart's "Show as table" and returns its rows as [label, value] pairs.
async function tableRows(page, chartTitle) {
  const card = page.getByRole("region", { name: chartTitle });
  await card.getByText("Show as table").click();
  const rows = card.getByRole("table").locator("tbody tr");
  await expect(rows.first()).toBeVisible();
  return rows.evaluateAll((trs) => trs.map((tr) => [...tr.querySelectorAll("td")].map((td) => td.textContent.trim())));
}

test("Reports is linked from the menu and the dashboard", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/dashboard");
  await expect(page.getByRole("navigation").getByRole("link", { name: "Reports" }).first()).toBeVisible();
  await page.getByRole("main").getByRole("link", { name: "View reports" }).click();
  await expect(page).toHaveURL(/\/hr\/reports/);
  await expect(page.getByRole("heading", { level: 1, name: "Reports" })).toBeVisible();
});

test("with no jobs, HR sees Not enough data yet and no charts", async ({ page }) => {
  await openWithSession(page, emptyHrCookies, "/hr/reports");
  await expect(page.getByText("Not enough data yet")).toBeVisible();
  await expect(page.getByRole("link", { name: "Post your first job" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("img")).toHaveCount(0);
  await expect(page.getByRole("main").getByRole("table")).toHaveCount(0);
});

test("a job with no applicants shows No applicants for this job yet and No hires yet", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/reports?job=${qaJob.id}&${RANGE}`);
  await expect(page.getByText("No applicants for this job yet")).toBeVisible();
  await expect(page.getByText("No hires yet")).toBeVisible();
  await expect(page.getByRole("main").getByRole("img")).toHaveCount(0);
});

test("Junior Web Developer numbers match the applications exactly", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/reports?job=${webJob.id}&${RANGE}`);

  expect(await tableRows(page, "Applicants per job")).toEqual([["Junior Web Developer", "5"]]);
  // Average of the four finished screenings (80, 60, 70, 90); the pending one is left out.
  expect(await tableRows(page, "Average score per job")).toEqual([["Junior Web Developer", "75"]]);
  expect(await tableRows(page, "Pipeline funnel")).toEqual([
    ["Applied", "5"],
    ["Shortlisted", "2"],
    ["Interview", "0"],
    ["Offer", "0"],
    ["Hired", "1"],
  ]);
  const missing = await tableRows(page, "Top missing requirements");
  expect(missing[0]).toEqual(["REST APIs", "3"]);

  await expect(page.getByRole("region", { name: "Average time to hire" })).toContainText("4 days");
  // 1 of 5 applications has screening pending.
  await expect(page.getByRole("region", { name: "Screening health" })).toContainText("20%");
});

test("choosing a job in the filter updates the charts", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/reports?${RANGE}`);
  expect(await tableRows(page, "Applicants per job")).toEqual([["Junior Web Developer", "5"], ["QA Intern", "0"]]);
  await page.getByLabel("Job", { exact: true }).selectOption({ label: "QA Intern" });
  await expect(page.getByText("No applicants for this job yet")).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`job=${qaJob.id}`));
});

test("a start date after the end date shows an error and runs no query", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/reports?from=${pakistanDate(0)}&to=${pakistanDate(-5)}`);
  await expect(page.getByText("Start date must be before end date")).toBeVisible();
  await expect(page.getByRole("main").getByRole("img")).toHaveCount(0);
});

test("privacy: no other company's data appears in any chart or table", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/reports?${RANGE}`);
  await tableRows(page, "Applicants per job");
  await tableRows(page, "Top missing requirements");
  await expect(page.getByText("Secret Data Analyst")).toHaveCount(0);
  await expect(page.getByText("Kubernetes Secret Skill")).toHaveCount(0);
  await expect(page.getByLabel("Job", { exact: true }).locator("option", { hasText: "Secret Data Analyst" })).toHaveCount(0);
});

test("a candidate opening Reports sees You don't have access to this page", async ({ page }) => {
  await openWithSession(page, candidateCookies, "/hr/reports");
  await expect(page.getByText("You don't have access to this page")).toBeVisible();
  await expect(page.getByRole("main").getByRole("img")).toHaveCount(0);
});
