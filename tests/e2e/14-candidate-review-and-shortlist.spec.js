import { test, expect } from "@playwright/test";
import {
  testEmail,
  createAccount,
  createJob,
  createApplication,
  findApplication,
  setScreening,
  deleteAccounts,
} from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";
import { makePdf } from "./helpers/files";

// Feature 14 · Candidate Review and Shortlist. Screenings are saved directly (no AI). Dummy data is deleted after.

test.describe.configure({ mode: "serial" });

const createdEmails = [];
let saraCookies;
let aliCookies;
let job;
let ali;
let aliApplication;

const SCREENING = {
  score: 74,
  match_percent: 80,
  must_have_match: 100,
  nice_to_have_match: 0,
  relevant_years: 1.3,
  meets_required_years: true,
  degree_found: "BS Computer Science",
  degree_match: true,
  summary: ["Junior front-end developer.", "Strong React and HTML.", "No REST API experience is shown in the CV."],
  rubric_breakdown: [
    { part: "skills_match", marks: 28, max: 35, reason: "Strong HTML, CSS, React and Git." },
    { part: "experience", marks: 28, max: 40, reason: "About one year of front-end work." },
    { part: "education", marks: 10, max: 10, reason: "Degree matches." },
    { part: "structure_formatting", marks: 3, max: 5, reason: "Clear sections." },
    { part: "contact_summary_links", marks: 3, max: 5, reason: "Has a summary." },
    { part: "grammar_clarity", marks: 2, max: 5, reason: "A few mistakes." },
  ],
  requirements_result: [
    { name: "HTML", type: "must", found: true, evidence: "Built responsive pages with HTML5" },
    { name: "React", type: "must", found: true, evidence: "Developed dashboard components in ReactJS" },
    { name: "REST APIs", type: "nice", found: false, evidence: "" },
  ],
  experience_items: [
    { title: "Junior Frontend Developer", type: "job", start: "2025-11", end: "present", relevant: true },
    { title: "Frontend Developer Intern", type: "internship", start: "2025-03", end: "2025-08", relevant: true },
  ],
};

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-review");
  const aliEmail = testEmail("ali-review");
  createdEmails.push(saraEmail, aliEmail);
  const sara = await createAccount({ role: "hr", fullName: "Sara Khan", email: saraEmail, companyName: "ABC Tech" });
  ali = await createAccount({ role: "candidate", fullName: "Ali Raza", email: aliEmail });
  job = await createJob(sara.companyId, { title: "Junior Web Developer" });
  aliApplication = await createApplication({ job, candidate: { ...ali, fullName: "Ali Raza" }, cvText: makePdf() });
  await setScreening(aliApplication.id, SCREENING);
  saraCookies = await sessionCookies(browser, saraEmail);
  aliCookies = await sessionCookies(browser, aliEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

test("Candidate Detail shows Open original CV, score breakdown, requirements, experience, degree and summary", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/candidates/${aliApplication.id}`);
  await expect(page.getByText("AI suggestions are advice only — you make the decision")).toBeVisible();
  // The CV opens from the link at the top; there is no embedded preview.
  await expect(page.getByRole("link", { name: "Open original CV" })).toHaveAttribute("href", `/hr/candidates/${aliApplication.id}/cv`);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.getByRole("img", { name: /Score 74 out of 100/ })).toBeVisible();
  await expect(page.getByText("Strong HTML, CSS, React and Git.")).toBeVisible();
  await expect(page.getByText("Developed dashboard components in ReactJS")).toBeVisible();
  await expect(page.getByText(/Frontend Developer Intern/)).toBeVisible();
  await expect(page.getByText("Counts half")).toBeVisible();
  await expect(page.getByText("BS Computer Science ✓")).toBeVisible();
  await expect(page.getByText("No REST API experience is shown in the CV.")).toBeVisible();
  await expect(page.getByText("No notes yet")).toBeVisible();
});

test("opening a candidate the first time lowers the job card's new applicant count by one", async ({ page }) => {
  // A second, unopened applicant.
  const email = testEmail("usman-review");
  createdEmails.push(email);
  const usman = await createAccount({ role: "candidate", fullName: "Usman Tariq", email });
  await createApplication({ job, candidate: { ...usman, fullName: "Usman Tariq" } });

  // Ali was opened in the previous test, so only Usman is new.
  expect((await findApplication(aliApplication.id)).viewed_at).toBeTruthy();
  await openWithSession(page, saraCookies, "/hr/dashboard");
  const card = page.getByRole("article").filter({ hasText: job.title });
  await expect(card.getByText("2 applicants")).toBeVisible();
  await expect(card.getByText("1 new")).toBeVisible();
});

test("a note saves with Sara's name and time, and Shortlist changes Ali's status to Shortlisted", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/candidates/${aliApplication.id}`);
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Note can't be empty")).toBeVisible();

  await page.getByLabel("New note").fill("Strong React portfolio. Ask about REST APIs.");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Note saved")).toBeVisible();
  const notes = page.getByRole("list", { name: "Notes" });
  await expect(notes.getByText("Strong React portfolio. Ask about REST APIs.")).toBeVisible();
  await expect(notes.getByText(/Sara Khan · \d{1,2} [A-Z][a-z]{2}, \d{1,2}:\d{2} [ap]m/)).toBeVisible();

  await page.getByRole("button", { name: "Shortlist" }).click();
  await expect(page.getByText("Candidate shortlisted")).toBeVisible();
  const saved = await findApplication(aliApplication.id);
  expect(saved.status).toBe("shortlisted");

  // Ali sees Shortlisted (and never the note).
  await openWithSession(page, aliCookies, `/my-applications/${aliApplication.id}`);
  await expect(page.getByText("Shortlisted").first()).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Ask about REST APIs");
});

test("Reject asks to confirm first", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/candidates/${aliApplication.id}`);
  await page.getByRole("button", { name: "Reject" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog.getByText("Reject Ali Raza?")).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  expect((await findApplication(aliApplication.id)).status).toBe("shortlisted");

  await page.getByRole("button", { name: "Reject" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Reject candidate" }).click();
  await expect(page.getByText("Candidate rejected")).toBeVisible();
  expect((await findApplication(aliApplication.id)).status).toBe("rejected");
});

test("Privacy: another company's candidate URL shows You don't have access to this page", async ({ page, browser }) => {
  const email = testEmail("other-review");
  createdEmails.push(email);
  await createAccount({ role: "hr", fullName: "Omar", email, companyName: "XYZ Labs" });
  const cookies = await sessionCookies(browser, email);
  await openWithSession(page, cookies, `/hr/candidates/${aliApplication.id}`);
  await expect(page.getByText("You don't have access to this page")).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Ali Raza");
});
