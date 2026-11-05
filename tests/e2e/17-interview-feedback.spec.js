import { test, expect } from "@playwright/test";
import {
  testEmail,
  createAccount,
  createJob,
  createApplication,
  createInterview,
  findApplication,
  findFeedback,
  findInterviews,
  readRowsAs,
  deleteAccounts,
  pakistanDate,
} from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";

// Feature 17 · Interview Feedback. Dummy accounts and data are deleted after the run.

test.describe.configure({ mode: "serial" });

const STRENGTHS = "Explained React state clearly and wrote clean code in the live task.";
const CONCERNS = "Little experience with REST API error handling.";
const createdEmails = [];
let saraCookies;
let aliCookies;
let aliEmail;
let aliApplication;
let aliInterview;

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-feedback");
  createdEmails.push(saraEmail);
  const sara = await createAccount({ role: "hr", fullName: "Sara Khan", email: saraEmail, companyName: "ABC Tech" });
  const job = await createJob(sara.companyId, { title: "Junior Web Developer" });

  aliEmail = testEmail("ali");
  createdEmails.push(aliEmail);
  const ali = await createAccount({ role: "candidate", fullName: "Ali Raza", email: aliEmail });
  aliApplication = await createApplication({ job, candidate: { ...ali, fullName: "Ali Raza" }, status: "interview" });
  // Ali's interview was yesterday, so it is over.
  aliInterview = await createInterview(aliApplication.id, { date: pakistanDate(-1), time: "11:00" });

  saraCookies = await sessionCookies(browser, saraEmail);
  aliCookies = await sessionCookies(browser, aliEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

const pastRow = (page) =>
  page.getByRole("region", { name: "Past interviews" }).getByRole("listitem").filter({ hasText: "Ali Raza" });

test("saving without a rating shows Please add a rating and a recommendation", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/interviews");
  await pastRow(page).getByRole("button", { name: "Add feedback" }).click();
  const form = page.getByRole("dialog");
  await form.getByLabel("Strengths").fill(STRENGTHS);
  await form.getByRole("radio", { name: "Offer" }).check();
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(form.getByText("Please add a rating and a recommendation")).toBeVisible();
  await expect(form.getByLabel("Strengths")).toHaveValue(STRENGTHS);
  expect(await findFeedback(aliInterview.id)).toHaveLength(0);
});

test("Sara saves feedback on Ali's Candidate Detail; the interview is done and his status stays", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/candidates/${aliApplication.id}`);
  const interviews = page.getByRole("region", { name: "Interviews" });
  await interviews.getByRole("button", { name: "Add feedback" }).click();
  const form = page.getByRole("dialog");
  await form.getByRole("radio", { name: "4 out of 5" }).check();
  await form.getByLabel("Strengths").fill(STRENGTHS);
  await form.getByLabel("Concerns").fill(CONCERNS);
  await form.getByRole("radio", { name: "Offer" }).check();
  await form.getByRole("button", { name: "Save feedback" }).click();

  await expect(page.getByText("Feedback saved")).toBeVisible();
  await expect(interviews.getByText("4 out of 5")).toBeVisible();
  await expect(interviews.getByText(STRENGTHS)).toBeVisible();
  await expect(interviews.getByText(CONCERNS)).toBeVisible();
  await expect(interviews.getByText("Recommends: Offer")).toBeVisible();
  await expect(interviews.getByRole("button", { name: "Add feedback" })).toHaveCount(0);

  const [feedback] = await findFeedback(aliInterview.id);
  expect(feedback).toMatchObject({ rating: 4, strengths: STRENGTHS, concerns: CONCERNS, recommendation: "offer" });
  const [interview] = await findInterviews(aliApplication.id);
  expect(interview.status).toBe("done");
  // "Offer" is advice only: Ali stays in Interview until Sara moves him.
  expect((await findApplication(aliApplication.id)).status).toBe("interview");

  await openWithSession(page, saraCookies, "/hr/interviews");
  await expect(pastRow(page).getByText("Done")).toBeVisible();
  await expect(pastRow(page).getByRole("button", { name: "Add feedback" })).toHaveCount(0);
});

test("privacy: Ali never sees the rating, strengths, concerns or recommendation", async ({ page }) => {
  await openWithSession(page, aliCookies, `/my-applications/${aliApplication.id}`);
  await expect(page.getByRole("region", { name: "Interview details" })).toBeVisible();
  const main = page.locator("main");
  for (const text of [STRENGTHS, CONCERNS, "4 out of 5", "Recommends"]) await expect(main).not.toContainText(text);
  // The database never returns feedback to the candidate.
  expect(await readRowsAs(aliEmail, "interview_feedback", "interview_id", aliInterview.id)).toHaveLength(0);
});
