import { test, expect } from "@playwright/test";
import {
  testEmail,
  createAccount,
  createJob,
  createApplication,
  findApplication,
  updateApplication,
  setScreening,
  findJob,
  deleteJobAs,
  updateApplicationStatusAs,
  addSavedJob,
  findSavedJobs,
  deleteAccounts,
} from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";

// Final statuses (Hired and Rejected never change) and deleting jobs with no applicants.
// Uses dummy accounts and data that are deleted after the run.

const FINAL_ERROR = "This decision is final and can't be changed";
const FINAL_TOOLTIP = "Final decision, can't be changed";
const FINAL_LINE = "This is final and can't be changed later.";
const HAS_APPLICANTS_TOOLTIP = "This job has applicants. Close it instead.";
const HAS_APPLICANTS_ERROR = "Jobs with applicants can't be deleted. Close the job instead.";

test.describe.configure({ mode: "serial" });

const createdEmails = [];
let sara;
let omar; // HR of another company
let saraCookies;
let aliCookies;
let job;
let ali;
let aliApplication; // Hired
let ayeshaApplication; // Rejected
let bilalApplication; // Applied
let zaraApplication; // Shortlisted

async function applicant(fullName, status) {
  const email = testEmail(fullName.split(" ")[0].toLowerCase());
  createdEmails.push(email);
  const account = await createAccount({ role: "candidate", fullName, email });
  const application = await createApplication({ job, candidate: { ...account, fullName }, status });
  await setScreening(application.id, { score: 70, match_percent: 70, relevant_years: 1, requirements_result: [] });
  return { account, application, email };
}

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-final");
  const omarEmail = testEmail("omar-final");
  createdEmails.push(saraEmail, omarEmail);
  sara = await createAccount({ role: "hr", fullName: "Sara Khan", email: saraEmail, companyName: "ABC Tech" });
  omar = await createAccount({ role: "hr", fullName: "Omar", email: omarEmail, companyName: "XYZ Soft" });
  job = await createJob(sara.companyId, { title: "Junior Web Developer" });

  const aliResult = await applicant("Ali Raza", "hired");
  ali = aliResult.account;
  aliApplication = aliResult.application;
  ayeshaApplication = (await applicant("Ayesha Malik", "rejected")).application;
  bilalApplication = (await applicant("Bilal Ahmed", "applied")).application;
  zaraApplication = (await applicant("Zara Noor", "shortlisted")).application;

  saraCookies = await sessionCookies(browser, saraEmail);
  aliCookies = await sessionCookies(browser, aliResult.email);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

function column(page, name) {
  return page.getByRole("region", { name: `${name} column` });
}

function card(page, name) {
  return page.getByRole("article").filter({ hasText: name });
}

function jobRow(page, title) {
  return page.getByRole("row").filter({ hasText: title });
}

// ---------- A) Hired and Rejected are final ----------

test("a Hired card shows a lock, can't be dragged, and its Move to menu is disabled", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/pipeline?job=${job.id}`);
  const aliCard = card(page, "Ali Raza");
  await expect(column(page, "Hired").getByRole("article").filter({ hasText: "Ali Raza" })).toBeVisible();
  await expect(aliCard).toHaveAttribute("data-final", "true");
  await expect(aliCard).toHaveAttribute("draggable", "false");
  await expect(aliCard.getByText("Final decision", { exact: true })).toBeAttached();
  await expect(page.getByLabel("Move Ali Raza to")).toBeDisabled();
  // The tooltip sits on the wrapper of the disabled Move to menu.
  await expect(page.getByLabel("Move Ali Raza to").locator("xpath=..")).toHaveAttribute("title", FINAL_TOOLTIP);

  // Rejected cards are locked the same way.
  await expect(card(page, "Ayesha Malik")).toHaveAttribute("draggable", "false");
  await expect(page.getByLabel("Move Ayesha Malik to")).toBeDisabled();

  // Trying to drag Ali away changes nothing.
  await aliCard.dragTo(column(page, "Offer"), { sourcePosition: { x: 12, y: 16 } });
  await expect(column(page, "Hired").getByRole("article").filter({ hasText: "Ali Raza" })).toBeVisible();
  expect((await findApplication(aliApplication.id)).status).toBe("hired");
});

test("the Hired and Rejected confirm dialogs say the decision is final", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/pipeline?job=${job.id}`);
  await page.getByLabel("Move Bilal Ahmed to").selectOption({ label: "Hired" });
  await expect(page.getByRole("dialog").getByText(FINAL_LINE)).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();

  await page.getByLabel("Move Bilal Ahmed to").selectOption({ label: "Rejected" });
  await expect(page.getByRole("alertdialog").getByText(FINAL_LINE)).toBeVisible();
  await page.getByRole("alertdialog").getByRole("button", { name: "Cancel" }).click();
  expect((await findApplication(bilalApplication.id)).status).toBe("applied");

  // Candidate Detail's Reject dialog says the same.
  await openWithSession(page, saraCookies, `/hr/candidates/${bilalApplication.id}`);
  await page.getByRole("button", { name: "Reject" }).click();
  await expect(page.getByRole("alertdialog").getByText(FINAL_LINE)).toBeVisible();
});

test("a Rejected candidate has no Shortlist or Reject button; notes and the CV stay", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/candidates/${ayeshaApplication.id}`);
  await expect(page.getByRole("heading", { level: 1, name: "Ayesha Malik" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Shortlist" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reject" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CV", exact: true })).toBeVisible();
});

test("the server blocks changing a final decision", async ({ page }) => {
  // Sara has Bilal open, then he is rejected elsewhere; her Shortlist click is refused.
  await openWithSession(page, saraCookies, `/hr/candidates/${bilalApplication.id}`);
  await updateApplication(bilalApplication.id, { status: "rejected" });
  await page.getByRole("button", { name: "Shortlist" }).click();
  await expect(page.getByText(FINAL_ERROR)).toBeVisible();
  expect((await findApplication(bilalApplication.id)).status).toBe("rejected");

  // Straight to the database, Row Level Security blocks it too.
  expect(await updateApplicationStatusAs(sara.email, aliApplication.id, "offer")).toEqual([]);
  expect((await findApplication(aliApplication.id)).status).toBe("hired");
});

test("the candidate can't withdraw after Hired", async ({ page }) => {
  await openWithSession(page, aliCookies, `/my-applications/${aliApplication.id}`);
  await expect(page.getByRole("heading", { level: 1, name: job.title })).toBeVisible();
  await expect(page.getByRole("button", { name: "Withdraw" })).toHaveCount(0);

  // Zara has her page open while Shortlisted; she is hired before she clicks Withdraw.
  const zaraEmail = createdEmails.find((email) => email.startsWith("zara."));
  const zaraCookies = await sessionCookies(page.context().browser(), zaraEmail);
  await openWithSession(page, zaraCookies, `/my-applications/${zaraApplication.id}`);
  await updateApplication(zaraApplication.id, { status: "hired" });
  await page.getByRole("button", { name: "Withdraw" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Withdraw application" }).click();
  await expect(page.getByRole("dialog").getByText("You can't withdraw at this stage")).toBeVisible();
  expect((await findApplication(zaraApplication.id)).status).toBe("hired");
});

// ---------- B) Deleting jobs with no applicants ----------

test("an open job with no applicants can be deleted, and saved copies go with it", async ({ page }) => {
  const empty = await createJob(sara.companyId, { title: "No Applicants Developer" });
  const closed = await createJob(sara.companyId, {
    title: "Closed Empty Developer",
    status: "closed",
    closed_reason: "manual",
    closed_at: new Date().toISOString(),
  });
  await addSavedJob(ali.id, empty.id);
  await openWithSession(page, saraCookies, "/hr/jobs");

  // Every row has a Delete action; closed jobs with no applicants can be deleted too.
  await expect(jobRow(page, closed.title).getByRole("button", { name: "Delete job" })).toBeEnabled();

  await jobRow(page, empty.title).getByRole("button", { name: "Delete job" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog.getByText("Delete this job?")).toBeVisible();
  await expect(dialog.getByText("This can't be undone.")).toBeVisible();
  await dialog.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(page.getByText("Job deleted")).toBeVisible();
  await expect(jobRow(page, empty.title)).toHaveCount(0);
  expect(await findJob(empty.id)).toBeNull();
  expect((await findSavedJobs(ali.id)).some((row) => row.job_id === empty.id)).toBe(false);
});

test("a job with an applicant can't be deleted", async ({ page }) => {
  // Even an applicant who withdrew counts.
  const withdrawnOnly = await createJob(sara.companyId, { title: "Withdrawn Only Developer" });
  await createApplication({ job: withdrawnOnly, candidate: { ...ali, fullName: "Ali Raza" }, status: "withdrawn" });
  const lateApplicant = await createJob(sara.companyId, { title: "Late Applicant Developer" });

  await openWithSession(page, saraCookies, "/hr/jobs");
  for (const title of [job.title, withdrawnOnly.title]) {
    await expect(jobRow(page, title).getByRole("button", { name: "Delete job" })).toBeDisabled();
    await expect(jobRow(page, title).getByTitle(HAS_APPLICANTS_TOOLTIP)).toBeVisible();
  }

  // Someone applies while Sara has My Jobs open: the server refuses the delete.
  await createApplication({ job: lateApplicant, candidate: { ...ali, fullName: "Ali Raza" } });
  await jobRow(page, lateApplicant.title).getByRole("button", { name: "Delete job" }).click();
  const dialog = page.getByRole("alertdialog");
  await dialog.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(dialog.getByText(HAS_APPLICANTS_ERROR)).toBeVisible();
  expect(await findJob(lateApplicant.id)).not.toBeNull();

  // Straight to the database, Row Level Security blocks it too.
  expect(await deleteJobAs(sara.email, job.id)).toEqual([]);
  expect(await findJob(job.id)).not.toBeNull();
});

test("another company's HR can't delete Sara's job", async ({ page, browser }) => {
  const empty = await createJob(sara.companyId, { title: "Private Empty Developer" });

  const omarCookies = await sessionCookies(browser, omar.email);
  await openWithSession(page, omarCookies, "/hr/jobs");
  await expect(page.getByRole("heading", { name: "My Jobs" })).toBeVisible();
  await expect(jobRow(page, empty.title)).toHaveCount(0);

  expect(await deleteJobAs(omar.email, empty.id)).toEqual([]);
  expect(await findJob(empty.id)).not.toBeNull();
});
