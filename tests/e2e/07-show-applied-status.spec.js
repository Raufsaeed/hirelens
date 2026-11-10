import { test, expect } from "@playwright/test";
import { testEmail, createAccount, createJob, createApplication, deleteAccounts } from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";
import { formatDay } from "../../lib/format-date.js";

// Show applied status (Features 07 and 08): a candidate sees which jobs they already applied to,
// on the jobs list and the job page. Logged-out visitors and HR see the pages as before.
// Uses dummy accounts and data that are deleted after the run.

const TAG = `${Date.now()}`;
const createdEmails = [];
let sara;
let saraCookies;
let aliCookies;
let appliedJob;
let otherJob;
let withdrawnJob;
let appliedApplication;
let withdrawnApplication;

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-applied");
  const aliEmail = testEmail("ali-applied");
  createdEmails.push(saraEmail, aliEmail);
  sara = await createAccount({ role: "hr", fullName: "Sara", email: saraEmail, companyName: "ABC Tech" });
  const ali = { ...(await createAccount({ role: "candidate", fullName: "Ali Raza", email: aliEmail })), fullName: "Ali Raza" };

  appliedJob = await createJob(sara.companyId, { title: `Applied Strip Developer ${TAG}` });
  otherJob = await createJob(sara.companyId, { title: `Not Applied Developer ${TAG}` });
  withdrawnJob = await createJob(sara.companyId, { title: `Withdrawn Strip Developer ${TAG}` });
  appliedApplication = await createApplication({ job: appliedJob, candidate: ali, status: "shortlisted" });
  withdrawnApplication = await createApplication({ job: withdrawnJob, candidate: ali, status: "withdrawn" });

  saraCookies = await sessionCookies(browser, saraEmail);
  aliCookies = await sessionCookies(browser, aliEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

function card(page, title) {
  return page.getByRole("article").filter({ hasText: title });
}

test("on the jobs list, the applied strip shows only on jobs Ali applied to", async ({ page }) => {
  await openWithSession(page, aliCookies, `/jobs?q=${TAG}`);
  const applied = card(page, appliedJob.title);
  await expect(applied.getByText("You applied to this job")).toBeVisible();
  await expect(applied.getByText(formatDay(appliedApplication.applied_at))).toBeVisible();
  await expect(applied.getByText("View job")).toBeVisible();

  await expect(card(page, otherJob.title)).toBeVisible();
  await expect(card(page, otherJob.title).getByText("You applied to this job")).toHaveCount(0);

  // A withdrawn application gets the warning strip instead.
  const withdrawn = card(page, withdrawnJob.title);
  await expect(withdrawn.getByText("You withdrew your application")).toBeVisible();
  await expect(withdrawn.getByText("You applied to this job")).toHaveCount(0);
});

test("the job page shows the applied banner and View my application instead of Apply now", async ({ page }) => {
  await openWithSession(page, aliCookies, `/jobs/${appliedJob.slug}`);
  await expect(page.getByText("You already applied to this job")).toBeVisible();
  await expect(page.getByText(`Applied on ${formatDay(appliedApplication.applied_at)} · Status: Shortlisted`)).toBeVisible();
  await expect(page.getByRole("link", { name: "View my application" })).toHaveAttribute(
    "href",
    `/my-applications/${appliedApplication.id}`
  );
  await expect(page.getByRole("link", { name: "Apply now" })).toHaveCount(0);
  // Never a score.
  await expect(page.getByText(/score/i)).toHaveCount(0);
});

test("a withdrawn application shows the warning banner", async ({ page }) => {
  await openWithSession(page, aliCookies, `/jobs/${withdrawnJob.slug}`);
  await expect(page.getByText("You withdrew your application")).toBeVisible();
  await expect(page.getByText(/^Withdrawn on \d{1,2} \w{3}\. You can't apply to this job again\.$/)).toBeVisible();
  await expect(page.getByRole("link", { name: "View application", exact: true })).toHaveAttribute(
    "href",
    `/my-applications/${withdrawnApplication.id}`
  );
  await expect(page.getByRole("link", { name: "Apply now" })).toHaveCount(0);
});

test("logged-out visitors and HR still see Apply now and no applied status", async ({ page }) => {
  await openWithSession(page, [], `/jobs/${appliedJob.slug}`);
  await expect(page.getByRole("link", { name: "Apply now" })).toBeVisible();
  await expect(page.getByText("You already applied to this job")).toHaveCount(0);
  await openWithSession(page, [], `/jobs?q=${TAG}`);
  await expect(card(page, appliedJob.title)).toBeVisible();
  await expect(page.getByText("You applied to this job")).toHaveCount(0);

  await openWithSession(page, saraCookies, `/jobs/${appliedJob.slug}`);
  await expect(page.getByRole("link", { name: "Apply now" })).toBeVisible();
  await expect(page.getByText("You already applied to this job")).toHaveCount(0);
});
