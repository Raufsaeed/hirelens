import { test, expect } from "@playwright/test";
import {
  TEST_PASSWORD,
  testEmail,
  createAccount,
  findJobs,
  readJobAsVisitor,
  pakistanDate,
  deleteAccounts,
} from "./helpers/test-accounts";

// Feature 02 · Post a Job. Uses dummy accounts that are deleted after the run.

const TITLE = "Junior Web Developer";
const createdEmails = [];
let sara;
let saraCookies; // Sara logs in once; each test reuses her session (fewer logins, no rate limits).

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
  const email = testEmail("sara-jobs");
  createdEmails.push(email);
  sara = await createAccount({ role: "hr", fullName: "Sara", email, companyName: "ABC Tech" });

  const context = await browser.newContext();
  await logIn(await context.newPage(), email);
  saraCookies = await context.cookies();
  await context.close();
});

async function useSaraSession(page) {
  await page.context().addCookies(saraCookies);
  await page.goto("/hr/dashboard");
}

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

async function logIn(page, email) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/(hr\/dashboard|my-applications)/);
}

async function addRequirement(page, name, type = "Must have") {
  await page.getByLabel("Requirement", { exact: true }).fill(name);
  await page.getByLabel("Requirement type").selectOption({ label: type });
  await page.getByRole("button", { name: "Add requirement" }).click();
}

async function fillJob(page, { title = TITLE, applyBy, requirements = true } = {}) {
  await page.goto("/hr/jobs/new");
  await page.getByLabel("Job title").fill(title);
  await page.getByLabel("Location").fill("Lahore");
  await page.getByLabel("Job type").selectOption({ label: "Full-time" });
  await page.getByLabel("Required years of experience").fill("1");
  await page.getByLabel("Required degree").fill("BS Computer Science");
  if (requirements) {
    await addRequirement(page, "HTML");
    await addRequirement(page, "React");
    await addRequirement(page, "REST APIs", "Nice to have");
  }
  await page
    .getByLabel("Description")
    .fill("Build and maintain web pages for ABC Tech clients using React.");
  if (applyBy) await page.getByLabel(/Apply by/).fill(applyBy);
}

test.describe("Create and publish", () => {
  test.beforeEach(async ({ page }) => {
    await useSaraSession(page);
  });

  test("the empty dashboard and My Jobs offer Post your first job", async ({ page }) => {
    await expect(page.getByText("You have no jobs yet").filter({ visible: true })).toBeVisible();
    await page.getByRole("link", { name: "My Jobs" }).first().click();
    await expect(page).toHaveURL(/\/hr\/jobs$/);
    await expect(page.getByText("You have no jobs yet").filter({ visible: true })).toBeVisible();
    await page.getByRole("link", { name: "Post your first job" }).click();
    await expect(page).toHaveURL(/\/hr\/jobs\/new/);
  });

  test("publishing with no requirements shows Add at least one requirement", async ({ page }) => {
    await fillJob(page, { requirements: false });
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Add at least one requirement")).toBeVisible();
    await expect(page).toHaveURL(/\/hr\/jobs\/new/);
    expect(await findJobs(sara.companyId)).toHaveLength(0);
  });

  test("an Apply by date in the past shows Apply by date can't be in the past", async ({ page }) => {
    await fillJob(page, { applyBy: pakistanDate(-1) });
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Apply by date can't be in the past")).toBeVisible();
    expect(await findJobs(sara.companyId)).toHaveLength(0);
  });

  test("missing fields show This field is required and a bad number is explained", async ({ page }) => {
    await page.goto("/hr/jobs/new");
    await page.getByLabel("Job title").fill(TITLE);
    await page.getByLabel("Required years of experience").fill("one");
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("This field is required").first()).toBeVisible();
    await expect(page.getByText("Enter a number of years, for example 1")).toBeVisible();
    expect(await findJobs(sara.companyId)).toHaveLength(0);
  });

  test("Sara publishes Junior Web Developer and gets the link with a working Copy link", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await fillJob(page, { applyBy: pakistanDate(3) });
    await page.getByRole("button", { name: "Publish" }).click();

    await expect(page.getByText(`${TITLE} is live`)).toBeVisible();
    const link = page.getByLabel("Job link");
    await expect(link).toHaveValue(/\/jobs\/abc-tech-junior-web-developer(-\d+)?$/);

    await page.getByRole("button", { name: "Copy link" }).click();
    await expect(page.getByText("Link copied")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(await link.inputValue());

    const [job] = await findJobs(sara.companyId);
    expect(job.status).toBe("open");
    expect(job.slug).toMatch(/^abc-tech-junior-web-developer(-\d+)?$/);
    expect(job.required_years).toBe(1);
    expect(job.requirements).toEqual([
      { name: "HTML", type: "must" },
      { name: "React", type: "must" },
      { name: "REST APIs", type: "nice" },
    ]);
    expect(job.apply_by).toBe(pakistanDate(3));
  });

  test("the job shows on the Dashboard and My Jobs as Open with 0 applicants and days left", async ({ page }) => {
    const card = page.getByRole("article").filter({ hasText: TITLE });
    await expect(card).toBeVisible();
    await expect(card.getByText("Open", { exact: true })).toBeVisible();
    await expect(card.getByText("0 applicants")).toBeVisible();
    await expect(card.getByText(/Apply by .* · 3 days left/)).toBeVisible();

    await page.goto("/hr/jobs");
    const row = page.getByRole("row").filter({ hasText: TITLE });
    await expect(row.getByText("Open", { exact: true })).toBeVisible();
    await expect(row.getByRole("cell", { name: "0", exact: true }).first()).toBeVisible();
    await expect(row.getByRole("button", { name: "Copy job link" })).toBeVisible();
  });

  test("a second Draft or Open job with the same title is refused", async ({ page }) => {
    await fillJob(page);
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText(`You already have an open job called ${TITLE}`)).toBeVisible();
    expect(await findJobs(sara.companyId)).toHaveLength(1);
  });

  test("an open job can be read by logged-out visitors", async () => {
    const [job] = await findJobs(sara.companyId);
    expect(await readJobAsVisitor(job.id)).toHaveLength(1);
  });
});

test.describe("Drafts", () => {
  test("Save as draft works with only a title, and a draft is never public", async ({ page }) => {
    await useSaraSession(page);
    await page.goto("/hr/jobs/new");
    await page.getByLabel("Job title").fill("QA Intern");
    await page.getByRole("button", { name: "Save as draft" }).click();

    await expect(page).toHaveURL(/\/hr\/jobs/);
    await expect(page.getByText("Draft saved")).toBeVisible();
    const row = page.getByRole("row").filter({ hasText: "QA Intern" });
    await expect(row.getByText("Draft", { exact: true })).toBeVisible();

    const draft = (await findJobs(sara.companyId)).find((job) => job.title === "QA Intern");
    expect(draft.status).toBe("draft");
    expect(draft.slug).toBeNull();
    expect(await readJobAsVisitor(draft.id)).toHaveLength(0);
  });
});

test.describe("Privacy", () => {
  test("another company's HR sees none of ABC Tech's jobs", async ({ page }) => {
    const email = testEmail("other-hr");
    createdEmails.push(email);
    await createAccount({ role: "hr", fullName: "Omar", email, companyName: "XYZ Labs" });
    await logIn(page, email);
    await page.goto("/hr/jobs");
    await expect(page.getByText("You have no jobs yet").filter({ visible: true })).toBeVisible();
    await expect(page.getByText(TITLE)).toHaveCount(0);
  });

  test("a candidate who opens Create Job sees You don't have access to this page", async ({ page }) => {
    const email = testEmail("ali-jobs");
    createdEmails.push(email);
    await createAccount({ role: "candidate", fullName: "Ali", email });
    await logIn(page, email);
    await page.goto("/hr/jobs/new");
    await expect(page.getByText("You don't have access to this page")).toBeVisible();
    await expect(page.getByLabel("Job title")).toHaveCount(0);
  });
});
