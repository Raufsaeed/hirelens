import { test, expect } from "@playwright/test";
import { testEmail, createAccount, createJob, createApplication, deleteAccounts } from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";

// Feature 09 · My Applications. Uses dummy accounts and applications that are deleted after the run.
// (Interview details on the timeline arrive with Feature 16.)

const createdEmails = [];
let ali;
let aliCookies;
let appliedApplication;
let shortlistedApplication;
let otherApplication;

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-myapps");
  const aliEmail = testEmail("ali-myapps");
  const hiraEmail = testEmail("hira-myapps");
  createdEmails.push(saraEmail, aliEmail, hiraEmail);
  const sara = await createAccount({ role: "hr", fullName: "Sara", email: saraEmail, companyName: "ABC Tech" });
  ali = await createAccount({ role: "candidate", fullName: "Ali Raza", email: aliEmail });
  const hira = await createAccount({ role: "candidate", fullName: "Hira", email: hiraEmail });

  const webJob = await createJob(sara.companyId, { title: "Junior Web Developer" });
  const qaJob = await createJob(sara.companyId, { title: "QA Intern", job_type: "internship" });
  appliedApplication = await createApplication({ job: webJob, candidate: { ...ali, fullName: "Ali Raza" } });
  shortlistedApplication = await createApplication({
    job: qaJob,
    candidate: { ...ali, fullName: "Ali Raza" },
    status: "shortlisted",
  });
  otherApplication = await createApplication({ job: webJob, candidate: { ...hira, fullName: "Hira" } });

  aliCookies = await sessionCookies(browser, aliEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

function applicationCard(page, title) {
  return page.getByRole("article").filter({ hasText: title });
}

test("My Applications lists each application with job, company, applied date and status", async ({ page }) => {
  await openWithSession(page, aliCookies, "/my-applications");
  const web = applicationCard(page, "Junior Web Developer");
  await expect(web.getByText("ABC Tech")).toBeVisible();
  await expect(web.getByText("Applied", { exact: true })).toBeVisible();
  await expect(web.getByText(/Applied on \d{1,2} [A-Z][a-z]{2}/)).toBeVisible();

  const qa = applicationCard(page, "QA Intern");
  await expect(qa.getByText("Shortlisted", { exact: true })).toBeVisible();
});

test("Application Detail shows the status timeline with the date of each change", async ({ page }) => {
  await openWithSession(page, aliCookies, "/my-applications");
  await applicationCard(page, "QA Intern").getByRole("link", { name: "QA Intern" }).click();
  await expect(page).toHaveURL(new RegExp(`/my-applications/${shortlistedApplication.id}$`));

  const timeline = page.getByRole("list", { name: "Application timeline" });
  await expect(timeline.getByText("Applied", { exact: true })).toBeVisible();
  await expect(timeline.getByText("Shortlisted", { exact: true })).toBeVisible();
  await expect(timeline.getByText("Interview", { exact: true })).toBeVisible();
  await expect(timeline.getByText("Hired", { exact: true })).toBeVisible();
  await expect(timeline.getByText(/\d{1,2} [A-Z][a-z]{2}, \d{1,2}:\d{2} [ap]m/).first()).toBeVisible();
});

test("on a 360px phone everything fits, and no score, match, AI summary or HR note appears", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ["/my-applications", `/my-applications/${appliedApplication.id}`]) {
    await openWithSession(page, aliCookies, path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
    const text = await page.locator("main").innerText();
    expect(text, path).not.toMatch(/score|match|AI summary|note from HR|HR note/i);
  }
});

test("opening another candidate's application by URL shows You don't have access to this page", async ({ page }) => {
  await openWithSession(page, aliCookies, `/my-applications/${otherApplication.id}`);
  await expect(page.getByText("You don't have access to this page")).toBeVisible();
  await expect(page.getByText("Hira")).toHaveCount(0);
});

test("a candidate with no applications sees the empty state with a link to browse jobs", async ({ page, browser }) => {
  const email = testEmail("new-myapps");
  createdEmails.push(email);
  await createAccount({ role: "candidate", fullName: "New Candidate", email });
  const cookies = await sessionCookies(browser, email);
  await openWithSession(page, cookies, "/my-applications");
  await expect(page.getByText("You haven't applied to any jobs yet")).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse jobs" })).toBeVisible();
});
