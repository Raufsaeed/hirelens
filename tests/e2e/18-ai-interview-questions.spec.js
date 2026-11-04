import { test, expect } from "@playwright/test";
import {
  testEmail,
  createAccount,
  createJob,
  createApplication,
  createInterview,
  setScreening,
  readRowsAs,
  deleteAccounts,
  pakistanDate,
} from "./helpers/test-accounts";
import { aiCookie, lastAiPrompt, openWithSession, sessionCookies } from "./helpers/session";
import { createClient } from "@supabase/supabase-js";

// Feature 18 · AI Interview Questions. Uses the saved fake Gemini answers in tests/e2e/fixtures/
// (never the real API). Dummy accounts and data are deleted after the run.

test.describe.configure({ mode: "serial" });

const FAILED = "Couldn't generate questions";
const OWN_QUESTION = "What do you enjoy most about front-end work?";
const PORTFOLIO = "Tell me about your GitHub portfolio";
const createdEmails = [];
let saraCookies;
let aliEmail;
let aliApplication;
let aliInterview;
let bilalApplication;

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function savedQuestions() {
  const { data, error } = await adminClient()
    .from("interview_questions")
    .select("*")
    .eq("interview_id", aliInterview.id)
    .order("position");
  if (error) throw error;
  return data;
}

async function applicant(job, fullName, status) {
  const email = testEmail(fullName.split(" ")[0].toLowerCase());
  createdEmails.push(email);
  const account = await createAccount({ role: "candidate", fullName, email });
  const application = await createApplication({ job, candidate: { ...account, fullName }, status });
  // The saved CV text still has Ali's name and phone here, to prove the questions request removes them.
  await setScreening(application.id, {
    score: 74,
    match_percent: 67,
    relevant_years: 1,
    cv_text_clean: `${fullName}\n0300 1234567\nFront-end developer. ReactJS, HTML and CSS. Hostel booking final year project.`,
    requirements_result: [
      { name: "HTML", type: "must", found: true, evidence: "HTML and CSS" },
      { name: "React", type: "must", found: true, evidence: "ReactJS" },
      { name: "REST APIs", type: "nice", found: false, evidence: null },
    ],
  });
  return { account, application, email };
}

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-questions");
  createdEmails.push(saraEmail);
  const sara = await createAccount({ role: "hr", fullName: "Sara Khan", email: saraEmail, companyName: "ABC Tech" });
  const job = await createJob(sara.companyId, { title: "Junior Web Developer" });
  const ali = await applicant(job, "Ali Raza", "interview");
  aliEmail = ali.email;
  aliApplication = ali.application;
  aliInterview = await createInterview(aliApplication.id, { date: pakistanDate(3), time: "11:00" });
  bilalApplication = (await applicant(job, "Bilal Ahmed", "shortlisted")).application;
  saraCookies = await sessionCookies(browser, saraEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

async function openAli(page, aiMode = "fixture:interview-questions") {
  await openWithSession(page, [...saraCookies, ...aiCookie(aiMode)], `/hr/candidates/${aliApplication.id}`);
  return page.getByRole("region", { name: "Interview questions" });
}

async function addQuestion(panel, text, type) {
  await panel.getByLabel("Your question").fill(text);
  if (type) await panel.getByLabel("Question type").selectOption({ label: type });
  await panel.getByRole("button", { name: "Add question" }).click();
}

test("without a scheduled interview, Generate questions is disabled", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/candidates/${bilalApplication.id}`);
  const panel = page.getByRole("region", { name: "Interview questions" });
  await expect(panel.getByRole("button", { name: "Generate questions" })).toBeDisabled();
  await expect(panel.getByText("Schedule an interview first")).toBeVisible();
});

test("if Gemini is unavailable Sara sees Couldn't generate questions with Retry, and can add her own", async ({ page }) => {
  const panel = await openAli(page, "unavailable");
  await panel.getByRole("button", { name: "Generate questions" }).click();
  await expect(panel.getByText(FAILED)).toBeVisible();
  await expect(panel.getByRole("button", { name: "Retry" })).toBeVisible();

  await addQuestion(panel, OWN_QUESTION, "Behavioural");
  await expect(page.getByText("Question added")).toBeVisible();
  await expect(panel.getByText(OWN_QUESTION)).toBeVisible();
  expect((await savedQuestions()).map((row) => row.source)).toEqual(["hr"]);
});

test("a set with a personal question is never shown", async ({ page }) => {
  const panel = await openAli(page, "fixture:interview-questions-personal");
  await panel.getByRole("button", { name: "Generate questions" }).click();
  await expect(panel.getByText(FAILED)).toBeVisible();
  await expect(page.locator("main")).not.toContainText("married");
  expect(await savedQuestions()).toHaveLength(1);
});

test("Generate questions shows eight questions with hints, one about the missing REST APIs", async ({ page }) => {
  const panel = await openAli(page);
  await panel.getByRole("button", { name: "Generate questions" }).click();
  await expect(panel.getByText("How would you fetch data from a REST API in React and handle errors?")).toBeVisible();

  await expect(panel.getByRole("list", { name: "Technical questions" }).getByRole("listitem")).toHaveCount(3);
  await expect(panel.getByRole("list", { name: "Behavioural questions" }).getByRole("listitem")).toHaveCount(4);
  await expect(panel.getByRole("list", { name: "Project questions" }).getByRole("listitem")).toHaveCount(2);
  await expect(panel.getByText("REST APIs (missing)")).toBeVisible();
  await expect(panel.getByText("What a good answer includes")).toHaveCount(8);

  const saved = await savedQuestions();
  expect(saved.filter((row) => row.source === "ai")).toHaveLength(8);
  expect(saved.filter((row) => row.source === "hr")).toHaveLength(1);

  // Privacy: Ali's name and phone are not in the text sent to Gemini.
  const prompt = await lastAiPrompt();
  expect(prompt).not.toMatch(/Ali|Raza|0300\s*1234567/);
  expect(prompt).toMatch(/ReactJS/);
  expect(prompt).toMatch(/REST APIs/);
});

test("Sara deletes one and adds her own (a type is required); the list is saved for next time", async ({ page }) => {
  let panel = await openAli(page);
  const removed = "How do you handle a deadline you might miss?";
  await panel.getByRole("listitem").filter({ hasText: removed }).getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("Question deleted")).toBeVisible();

  await addQuestion(panel, PORTFOLIO);
  await expect(panel.getByText("Please choose a question type")).toBeVisible();
  await addQuestion(panel, "");
  await expect(panel.getByText("Question can't be empty")).toBeVisible();
  await addQuestion(panel, PORTFOLIO, "Project");
  await expect(page.getByText("Question added")).toBeVisible();

  panel = await openAli(page);
  await expect(panel.getByRole("list", { name: "Project questions" }).getByText(PORTFOLIO)).toBeVisible();
  await expect(panel.getByText(removed)).toHaveCount(0);
  const saved = await savedQuestions();
  expect(saved).toHaveLength(9);
  expect(saved.find((row) => row.question === PORTFOLIO)).toMatchObject({ type: "project", source: "hr" });
});

test("Regenerate replaces the AI questions and keeps Sara's own", async ({ page }) => {
  const panel = await openAli(page);
  await panel.getByRole("button", { name: "Regenerate" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Replace questions" }).click();
  await expect(panel.getByText("How do you handle a deadline you might miss?")).toBeVisible();
  const saved = await savedQuestions();
  expect(saved.filter((row) => row.source === "ai")).toHaveLength(8);
  expect(saved.filter((row) => row.source === "hr").map((row) => row.question).sort()).toEqual([OWN_QUESTION, PORTFOLIO].sort());
});

test("candidates never see the questions", async () => {
  expect(await readRowsAs(aliEmail, "interview_questions", "interview_id", aliInterview.id)).toHaveLength(0);
});
