import { test, expect } from "@playwright/test";
import {
  testEmail,
  createAccount,
  createJob,
  getJob,
  createApplication,
  findApplication,
  setScreening,
  pakistanDate,
  deleteAccounts,
} from "./helpers/test-accounts";
import { aiCookie, sessionCookies, openWithSession } from "./helpers/session";
import { makePdf } from "./helpers/files";

// Feature 03 · Edit Job and Re-screen. Re-screening answers come from the saved fake Gemini response
// (tests/e2e/fixtures/gemini-screening.json), which includes TypeScript as missing.

test.describe.configure({ mode: "serial" });
test.setTimeout(120 * 1000);

const CV = [
  "Summary: Junior front-end developer who builds responsive web apps.",
  "Junior Frontend Developer, Pixel Labs, 2025-11 to present",
  "Developed dashboard components in ReactJS for a logistics client.",
  "Built responsive pages with HTML5 and CSS3 for client websites.",
  "Managed code on GitHub with pull requests and code reviews.",
  "Frontend Developer Intern, Web Hub, 2025-03 to 2025-08",
  "Education: BS Computer Science, FAST NUCES, 2021 to 2025",
];

const createdEmails = [];
let sara;
let saraCookies;

test.beforeAll(async ({ browser }) => {
  const email = testEmail("sara-edit");
  createdEmails.push(email);
  sara = await createAccount({ role: "hr", fullName: "Sara", email, companyName: "ABC Tech" });
  saraCookies = await sessionCookies(browser, email);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

// A job with two screened candidates (old requirements: HTML, React, REST APIs).
async function jobWithCandidates(title) {
  const job = await createJob(sara.companyId, { title, apply_by: pakistanDate(10) });
  const applications = [];
  for (const name of ["Ali Raza", "Usman Tariq"]) {
    const email = testEmail(name.split(" ")[0].toLowerCase());
    createdEmails.push(email);
    const account = await createAccount({ role: "candidate", fullName: name, email });
    const application = await createApplication({ job, candidate: { ...account, fullName: name }, cvText: makePdf(CV) });
    await setScreening(application.id, {
      score: 70,
      match_percent: 67,
      requirements_result: [
        { name: "HTML", type: "must", found: true, evidence: "HTML5" },
        { name: "React", type: "must", found: true, evidence: "ReactJS" },
        { name: "REST APIs", type: "nice", found: false, evidence: "" },
      ],
    });
    applications.push(application);
  }
  return { job, applications };
}

async function addTypeScript(page) {
  await page.getByLabel("Requirement", { exact: true }).fill("TypeScript");
  await page.getByLabel("Requirement type").selectOption({ label: "Nice to have" });
  await page.getByRole("button", { name: "Add requirement" }).click();
}

test("Sara edits a job from My Jobs, the form is filled in, and saving shows Job updated", async ({ page }) => {
  const job = await createJob(sara.companyId, { title: "QA Engineer", apply_by: pakistanDate(12) });
  await openWithSession(page, saraCookies, "/hr/jobs");
  await page.getByRole("row").filter({ hasText: job.title }).getByRole("link", { name: "Edit job" }).click();
  await expect(page).toHaveURL(new RegExp(`/hr/jobs/${job.id}/edit$`));

  await expect(page.getByLabel("Job title")).toHaveValue(job.title);
  await expect(page.getByLabel(/Apply by/)).toHaveValue(pakistanDate(12));
  await expect(page.getByRole("list", { name: "Added requirements" }).getByText(/React/)).toBeVisible();

  await page.getByLabel("Location").fill("Karachi");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Job updated")).toBeVisible();
  const saved = await getJob(job.id);
  expect(saved.location).toBe("Karachi");
  expect(saved.slug).toBe(job.slug);
});

test("clearing the title shows This field is required and the job is not saved", async ({ page }) => {
  const job = await createJob(sara.companyId, { title: "Data Analyst" });
  await openWithSession(page, saraCookies, `/hr/jobs/${job.id}/edit`);
  await page.getByLabel("Job title").fill("");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("This field is required")).toBeVisible();
  expect((await getJob(job.id)).title).toBe("Data Analyst");
});

test("changing requirements after people applied warns, and Not now keeps the old scores", async ({ page }) => {
  const { job, applications } = await jobWithCandidates("Frontend Developer");
  await openWithSession(page, saraCookies, `/hr/jobs/${job.id}/edit`);
  await addTypeScript(page);
  await page.getByRole("button", { name: "Save changes" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("2 candidates were screened against the old requirements. Re-screen them now?")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Re-screen candidates" })).toBeVisible();
  await dialog.getByRole("button", { name: "Not now" }).click();

  await expect(page.getByText("Job updated")).toBeVisible();
  expect((await getJob(job.id)).requirements.map((item) => item.name)).toContain("TypeScript");
  expect((await findApplication(applications[0].id)).screening.score).toBe(70);
});

test("Re-screen candidates shows progress and updates every candidate's requirements and score", async ({ page }) => {
  const { job, applications } = await jobWithCandidates("Web Developer");
  await openWithSession(page, saraCookies, `/hr/jobs/${job.id}/edit`);
  await addTypeScript(page);
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Re-screen candidates" }).click();

  await expect(page.getByText("All candidates re-screened")).toBeVisible({ timeout: 60 * 1000 });
  for (const application of applications) {
    const screening = (await findApplication(application.id)).screening;
    const typescript = screening.requirements_result.find((item) => item.name === "TypeScript");
    expect(typescript).toMatchObject({ found: false });
    expect(screening.score).toBe(79);
  }
});

test("if some candidates fail, it says how many could not be screened and are Pending", async ({ page }) => {
  const { job, applications } = await jobWithCandidates("Backend Developer");
  await openWithSession(page, [...saraCookies, ...aiCookie("unavailable")], `/hr/jobs/${job.id}/edit`);
  await addTypeScript(page);
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Re-screen candidates" }).click();

  await expect(page.getByText("2 candidates could not be screened and are Pending")).toBeVisible({ timeout: 60 * 1000 });
  expect((await findApplication(applications[0].id)).screening_status).toBe("pending");
});
