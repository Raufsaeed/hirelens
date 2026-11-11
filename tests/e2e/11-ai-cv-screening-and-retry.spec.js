import { test, expect } from "@playwright/test";
import {
  testEmail,
  createAccount,
  createJob,
  createApplication,
  findApplication,
  findApplications,
  waitForScreening,
  updateApplication,
  readScreeningsAs,
  deleteAccounts,
} from "./helpers/test-accounts";
import { aiCookie, sessionCookies, openWithSession } from "./helpers/session";
import { makePdf, pdfFile } from "./helpers/files";

// Feature 11 · AI CV Screening and Retry.
// AI answers come from tests/e2e/fixtures/gemini-screening.json (no API calls), except the last test,
// which calls the real Gemini API only when RUN_REAL_AI=1 is set. Dummy data is deleted after the run.

test.describe.configure({ mode: "serial" });
test.setTimeout(120 * 1000);

// Ali's CV: the fixture's evidence quotes come from these lines.
const ALI_CV = [
  "Ali Raza",
  "ali.raza.e2e@example.com | 0300 1234567 | House 12, Street 5, Gulberg, Lahore",
  "Summary: Junior front-end developer who builds responsive web apps.",
  "Experience",
  "Junior Frontend Developer, Pixel Labs, 2025-11 to present",
  "Developed dashboard components in ReactJS for a logistics client.",
  "Built responsive pages with HTML5 and CSS3 for client websites.",
  "Managed code on GitHub with pull requests and code reviews.",
  "Frontend Developer Intern, Web Hub, 2025-03 to 2025-08",
  "Education: BS Computer Science, FAST NUCES, 2021 to 2025",
  "Projects: Hostel booking site built with React and Firebase.",
];

const createdEmails = [];
let sara;
let saraCookies;
let ali;
let aliCookies;
let job;

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-screen");
  const aliEmail = testEmail("ali-screen");
  createdEmails.push(saraEmail, aliEmail);
  sara = await createAccount({ role: "hr", fullName: "Sara", email: saraEmail, companyName: "ABC Tech" });
  ali = await createAccount({ role: "candidate", fullName: "Ali Raza", email: aliEmail });
  job = await createJob(sara.companyId, {
    title: "Junior Web Developer",
    required_years: 1,
    required_degree: "BS Computer Science",
    requirements: [
      { name: "HTML", type: "must" },
      { name: "CSS", type: "must" },
      { name: "React", type: "must" },
      { name: "Git", type: "must" },
      { name: "REST APIs", type: "nice" },
    ],
  });
  saraCookies = await sessionCookies(browser, saraEmail);
  aliCookies = await sessionCookies(browser, aliEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

async function applyAs(page, cookies, theJob, file) {
  await openWithSession(page, cookies, `/jobs/${theJob.slug}/apply`);
  await page.getByLabel("Phone").fill("0300 1234567");
  await page.locator('input[type="file"]').setInputFiles(file);
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByRole("heading", { name: /Your application has been sent/ })).toBeVisible();
}

async function applicationTo(candidateId, jobId) {
  return (await findApplications(candidateId)).find((row) => row.job_id === jobId);
}

function candidateRow(page, name) {
  return page.getByRole("row").filter({ hasText: name });
}

let aliApplicationId;

test("a new application is screened in the background; numbers are calculated in code", async ({ page }) => {
  await applyAs(page, aliCookies, job, pdfFile("ali-cv.pdf", ALI_CV));
  aliApplicationId = (await applicationTo(ali.id, job.id)).id;

  const screened = await waitForScreening(aliApplicationId);
  expect(screened.screening_status).toBe("done");
  const screening = screened.screening;

  // Score = the six rubric marks added up; match = found ÷ total (4 of 5), must and nice separately.
  expect(screening.score).toBe(79);
  expect(screening.rubric_breakdown).toHaveLength(6);
  expect(Number(screening.match_percent)).toBe(80);
  expect(Number(screening.must_have_match)).toBe(100);
  expect(Number(screening.nice_to_have_match)).toBe(0);

  // ReactJS counts as React, with its CV evidence.
  const react = screening.requirements_result.find((item) => item.name === "React");
  expect(react).toMatchObject({ found: true, evidence: expect.stringMatching(/ReactJS/) });
  expect(screening.requirements_result.find((item) => item.name === "REST APIs").found).toBe(false);

  // Relevant years: the job in full, the internship half, the project not at all.
  expect(Number(screening.relevant_years)).toBeGreaterThan(1);
  expect(screening.meets_required_years).toBe(true);
  expect(screening.degree_match).toBe(true);
  expect(screening.degree_found).toBe("BS Computer Science");
  expect(screening.summary).toHaveLength(3);

  // Privacy: name, email, phone and address are not in the text sent to Gemini.
  expect(screening.cv_text_clean).not.toMatch(/Ali|Raza|ali\.raza\.e2e@example\.com|0300\s*1234567|Street 5/);
  expect(screening.cv_text_clean).toMatch(/ReactJS/);
});

test("Sara sees the score and match percentage; candidates never see screening results", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/candidates?job=${job.id}`);
  const row = candidateRow(page, "Ali Raza");
  await expect(row.getByText("79", { exact: true })).toBeVisible();
  await expect(row.getByText("80%")).toBeVisible();

  // Row Level Security: Ali can't read his own screening, and My Applications shows no score.
  expect(await readScreeningsAs(ali.email, aliApplicationId)).toHaveLength(0);
  await openWithSession(page, aliCookies, "/my-applications");
  await expect(page.locator("main")).not.toContainText("79");
});

test("if AI is still down, Retry keeps Pending with a message; once AI works, Retry gives the same score", async ({ page }) => {
  await updateApplication(aliApplicationId, { screening_status: "pending" });

  await openWithSession(page, [...saraCookies, ...aiCookie("unavailable")], `/hr/candidates?job=${job.id}`);
  let row = candidateRow(page, "Ali Raza");
  await expect(row.getByText("Pending", { exact: true })).toBeVisible();
  await row.getByRole("button", { name: "Retry screening" }).click();
  await expect(row.getByText("AI is still unavailable, try again in a few minutes")).toBeVisible();
  expect((await findApplication(aliApplicationId)).screening_status).toBe("pending");

  await openWithSession(page, saraCookies, `/hr/candidates?job=${job.id}`);
  row = candidateRow(page, "Ali Raza");
  await row.getByRole("button", { name: "Retry screening" }).click();
  await expect(row.getByText("Done", { exact: true })).toBeVisible();
  const again = await findApplication(aliApplicationId);
  expect(again.screening_status).toBe("done");
  expect(again.screening.score).toBe(79);
});

test("if Gemini is unavailable or returns invalid JSON, a new application ends up Pending with Retry screening", async ({ page, browser }) => {
  for (const mode of ["unavailable", "invalid-json"]) {
    const email = testEmail(`bilal-${mode}`);
    createdEmails.push(email);
    const bilal = await createAccount({ role: "candidate", fullName: "Bilal Khan", email });
    const cookies = await sessionCookies(browser, email);
    await applyAs(page, [...cookies, ...aiCookie(mode)], job, pdfFile("bilal-cv.pdf", ALI_CV.slice(2)));
    const screened = await waitForScreening((await applicationTo(bilal.id, job.id)).id);
    expect(screened.screening_status, mode).toBe("pending");
    expect(screened.screening.error_message, mode).toBeTruthy();
    expect(screened.screening.score, mode).toBeNull();
  }

  // Pending rows sit at the bottom, after the ranked candidate, with Retry screening.
  await openWithSession(page, saraCookies, `/hr/candidates?job=${job.id}`);
  const names = await page.locator("tbody tr td:nth-child(2)").allInnerTexts();
  expect(names[0]).toBe("Ali Raza");
  expect(names.slice(1)).toEqual(["Bilal Khan", "Bilal Khan"]);
  await expect(candidateRow(page, "Bilal Khan").first().getByRole("button", { name: "Retry screening" })).toBeVisible();
});

test("a scanned CV shows CV could not be read; Sara opens it and saves a manual review note", async ({ page }) => {
  const email = testEmail("hira-screen");
  createdEmails.push(email);
  const hira = await createAccount({ role: "candidate", fullName: "Hira Ahmed", email });
  const application = await createApplication({ job, candidate: { ...hira, fullName: "Hira Ahmed" }, cvText: makePdf([]) });
  await updateApplication(application.id, { screening_status: "pending" });

  await openWithSession(page, saraCookies, `/hr/candidates?job=${job.id}`);
  const row = candidateRow(page, "Hira Ahmed");
  await row.getByRole("button", { name: "Retry screening" }).click();
  await expect(row.getByText("CV could not be read")).toBeVisible();
  expect((await findApplication(application.id)).screening_status).toBe("failed");

  await row.getByRole("link", { name: "Hira Ahmed" }).click();
  await expect(page.getByText("CV could not be read").first()).toBeVisible();
  const cvLink = page.getByRole("link", { name: "Open original CV" });
  const cvResponse = await page.request.get(await cvLink.getAttribute("href"));
  expect(cvResponse.ok()).toBe(true);

  await page.getByLabel("Manual review note").fill("Scanned CV. Read by hand: 1 year of React, BS CS.");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByText("Note saved")).toBeVisible();
  const saved = await findApplication(application.id);
  expect(saved.notes.some((note) => note.is_manual_review && note.body.includes("Read by hand"))).toBe(true);
  expect(saved.screening.score).toBeNull();
});

test("a screening stuck in checking for over 5 minutes offers Retry screening; a fresh one doesn't", async ({ page }) => {
  const email = testEmail("omar-screen");
  createdEmails.push(email);
  const omar = await createAccount({ role: "candidate", fullName: "Omar Shah", email });
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  // Already viewed, so opening it doesn't refresh updated_at (the time the 5 minutes count from).
  const stuck = await createApplication({
    job,
    candidate: { ...omar, fullName: "Omar Shah" },
    cvText: makePdf(ALI_CV),
    fields: { screening_status: "processing", updated_at: tenMinutesAgo, viewed_at: tenMinutesAgo },
  });

  const freshEmail = testEmail("zara-screen");
  createdEmails.push(freshEmail);
  const zara = await createAccount({ role: "candidate", fullName: "Zara Malik", email: freshEmail });
  await createApplication({
    job,
    candidate: { ...zara, fullName: "Zara Malik" },
    cvText: makePdf(ALI_CV),
    fields: { screening_status: "processing", viewed_at: new Date().toISOString() },
  });

  await openWithSession(page, saraCookies, `/hr/candidates?job=${job.id}`);
  await expect(candidateRow(page, "Omar Shah").getByRole("button", { name: "Retry screening" })).toBeVisible();
  await expect(candidateRow(page, "Zara Malik").getByText("Screening…")).toBeVisible();
  await expect(candidateRow(page, "Zara Malik").getByRole("button", { name: "Retry screening" })).toHaveCount(0);

  await candidateRow(page, "Omar Shah").getByRole("link", { name: "Omar Shah" }).click();
  await expect(page.getByRole("heading", { name: "Screening is taking too long" })).toBeVisible();
  await page.getByRole("button", { name: "Retry screening" }).click();
  await expect.poll(async () => (await findApplication(stuck.id)).screening_status, { timeout: 60000 }).toBe("done");
});

// The only test that calls the real Gemini API. Run it with: RUN_REAL_AI=1 npm run test:e2e
test("real Gemini: screens a CV with evidence and matches skills by meaning", async ({ page, browser }) => {
  test.skip(!process.env.RUN_REAL_AI, "Set RUN_REAL_AI=1 to call the real Gemini API");
  const email = testEmail("ali-real-ai");
  createdEmails.push(email);
  const candidate = await createAccount({ role: "candidate", fullName: "Ali Raza", email });
  const cookies = await sessionCookies(browser, email);
  await applyAs(page, [...cookies, ...aiCookie("real")], job, pdfFile("ali-cv.pdf", ALI_CV));

  const screened = await waitForScreening((await applicationTo(candidate.id, job.id)).id);
  expect(screened.screening_status).toBe("done");
  expect(screened.screening.score).toBeGreaterThan(0);
  const react = screened.screening.requirements_result.find((item) => item.name === "React");
  expect(react.found).toBe(true);
  expect(react.evidence).toMatch(/ReactJS/i);
  expect(screened.screening.cv_text_clean).not.toMatch(/Ali|Raza|0300\s*1234567/);
});
