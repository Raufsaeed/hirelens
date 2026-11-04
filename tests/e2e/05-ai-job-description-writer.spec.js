import { test, expect } from "@playwright/test";
import { createAccount, deleteAccounts, findJobs, testEmail } from "./helpers/test-accounts";
import { aiCookie, openWithSession, sessionCookies } from "./helpers/session";

// Feature 05 · AI Job Description Writer. Uses the saved fake Gemini answer
// tests/e2e/fixtures/gemini-jd-writer.json (never the real API). Dummy accounts are deleted after the run.

const TITLE = "Junior Web Developer";
const REQUIREMENTS = [
  ["HTML", "Must have"],
  ["CSS", "Must have"],
  ["React", "Must have"],
  ["Git", "Must have"],
  ["REST APIs", "Nice to have"],
];
const DRAFT_START = /^About the role\nABC Tech is looking for a Junior Web Developer/;
const FAILED = "Couldn't write a description right now. You can write it yourself or try again";
const KEY_POINTS = "small friendly team, hybrid in Lahore";

const createdEmails = [];
let sara;
let saraCookies;

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
  const email = testEmail("sara-jd");
  createdEmails.push(email);
  sara = await createAccount({ role: "hr", fullName: "Sara", email, companyName: "ABC Tech" });
  saraCookies = await sessionCookies(browser, email);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

// Opens Create Job with the fake Gemini answer (or a fake failure).
async function openForm(page, aiMode = "fixture:jd-writer") {
  await openWithSession(page, [...saraCookies, ...aiCookie(aiMode)], "/hr/jobs/new");
}

async function fillJob(page, title = TITLE) {
  await page.getByLabel("Job title").fill(title);
  await page.getByLabel("Location").fill("Lahore");
  await page.getByLabel("Job type").selectOption({ label: "Full-time" });
  await page.getByLabel("Required years of experience").fill("1");
  await page.getByLabel("Required degree").fill("BS Computer Science");
  await page.getByLabel("Key points").fill(KEY_POINTS);
  for (const [name, type] of REQUIREMENTS) {
    await page.getByLabel("Requirement", { exact: true }).fill(name);
    await page.getByLabel("Requirement type").selectOption({ label: type });
    await page.getByRole("button", { name: "Add requirement" }).click();
  }
}

const description = (page) => page.getByLabel("Description");
const writeButton = (page) => page.getByRole("button", { name: "Write with AI" });

test("with only a title, Write with AI is disabled with a hint", async ({ page }) => {
  await openForm(page);
  await expect(writeButton(page)).toBeDisabled();
  await page.getByLabel("Job title").fill(TITLE);
  await expect(writeButton(page)).toBeDisabled();
  await expect(page.getByText("Add a title and at least one requirement first")).toBeVisible();
  // A key point is enough.
  await page.getByLabel("Key points").fill("hybrid in Lahore");
  await expect(writeButton(page)).toBeEnabled();
});

test("the draft has three sections, uses only Sara's requirements and shows suggestions separately", async ({ page }) => {
  await openForm(page);
  await fillJob(page);
  await writeButton(page).click();

  await expect(description(page)).toHaveValue(DRAFT_START);
  const text = await description(page).inputValue();
  expect(text).toContain("\n\nResponsibilities\n- ");
  expect(text).toContain("\n\nWhat we're looking for\n- ");
  for (const [name] of REQUIREMENTS) expect(text).toContain(name);
  expect(text).not.toContain("TypeScript");
  await expect(page.getByText("Review and edit before publishing")).toBeVisible();

  // TypeScript shows only as a labelled suggestion, and is added only when Sara accepts it.
  const suggestions = page.getByRole("list", { name: "Suggested requirements" });
  await expect(suggestions.getByText("TypeScript")).toBeVisible();
  await expect(suggestions.getByText("Suggestion")).toBeVisible();
  const added = page.getByRole("list", { name: "Added requirements" });
  await expect(added.getByText(/TypeScript/)).toHaveCount(0);
  await page.getByRole("button", { name: "Accept TypeScript" }).click();
  await expect(added.getByText("TypeScript · nice to have")).toBeVisible();
  await expect(suggestions).toHaveCount(0);

  // Nothing is saved until Sara clicks Save as draft or Publish.
  expect(await findJobs(sara.companyId)).toHaveLength(0);
});

test("Remove drops a suggestion without adding it", async ({ page }) => {
  await openForm(page);
  await fillJob(page);
  await writeButton(page).click();
  await page.getByRole("button", { name: "Remove suggestion TypeScript" }).click();
  await expect(page.getByRole("list", { name: "Suggested requirements" })).toHaveCount(0);
  await expect(page.getByRole("list", { name: "Added requirements" }).getByText(/TypeScript/)).toHaveCount(0);
});

test("Regenerate after editing asks first and keeps Sara's text unless she confirms", async ({ page }) => {
  await openForm(page);
  await fillJob(page);
  await writeButton(page).click();
  await expect(description(page)).toHaveValue(DRAFT_START);

  await description(page).fill("My own words about the job.");
  await page.getByRole("button", { name: "Regenerate" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Replace your edited text with a new draft?")).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(description(page)).toHaveValue("My own words about the job.");

  await page.getByRole("button", { name: "Regenerate" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Replace" }).click();
  await expect(description(page)).toHaveValue(DRAFT_START);
});

test("the published job shows Sara's edited text, not the draft", async ({ page }) => {
  await openForm(page);
  await fillJob(page);
  await writeButton(page).click();
  await expect(description(page)).toHaveValue(DRAFT_START);
  const edited = (await description(page).inputValue()).replace("small, friendly team", "small, kind team");
  await description(page).fill(edited);

  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText(`${TITLE} is live`)).toBeVisible();
  const [job] = await findJobs(sara.companyId);
  expect(job.status).toBe("open");
  expect(job.description).toBe(edited.trim());
});

test("if Gemini is unavailable Sara sees a friendly message and can still write and publish", async ({ page }) => {
  for (const mode of ["unavailable", "invalid-json"]) {
    await openForm(page, mode);
    await fillJob(page, `Frontend Developer ${mode}`);
    await writeButton(page).click();
    await expect(page.getByText(FAILED)).toBeVisible();
    await expect(description(page)).toHaveValue("");
    await expect(page.getByLabel("Key points")).toHaveValue(KEY_POINTS);
  }
  await description(page).fill("Build web pages for ABC Tech clients with React.");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText(/is live/)).toBeVisible();
});
