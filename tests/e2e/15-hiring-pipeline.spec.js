import { test, expect } from "@playwright/test";
import {
  testEmail,
  createAccount,
  createJob,
  createApplication,
  findApplication,
  findApplications,
  setScreening,
  deleteAccounts,
} from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";

// Feature 15 · Hiring Pipeline. Screenings are saved directly (no AI). Dummy data is deleted after.

test.describe.configure({ mode: "serial" });

const COLUMNS = ["Applied", "Shortlisted", "Interview", "Offer", "Hired", "Rejected"];
const createdEmails = [];
let saraCookies;
let aliCookies;
let job;
let ali;
let aliApplication;
let ayeshaApplication;

async function applicant(fullName, status, score) {
  const email = testEmail(fullName.split(" ")[0].toLowerCase());
  createdEmails.push(email);
  const account = await createAccount({ role: "candidate", fullName, email });
  const application = await createApplication({ job, candidate: { ...account, fullName }, status });
  await setScreening(application.id, { score, match_percent: 70, relevant_years: 1, requirements_result: [] });
  return { account, application, email };
}

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-pipeline");
  createdEmails.push(saraEmail);
  const sara = await createAccount({ role: "hr", fullName: "Sara Khan", email: saraEmail, companyName: "ABC Tech" });
  job = await createJob(sara.companyId, { title: "Junior Web Developer" });

  const aliResult = await applicant("Ali Raza", "shortlisted", 74);
  ali = aliResult.account;
  aliApplication = aliResult.application;
  ayeshaApplication = (await applicant("Ayesha Malik", "applied", 88)).application;
  await applicant("Usman Tariq", "withdrawn", 61);

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

// Drags a card by its handle (top left), like a person would; the middle of the card is its menu.
async function dragCard(page, name, columnName) {
  await card(page, name).dragTo(column(page, columnName), { sourcePosition: { x: 12, y: 16 } });
}

test("the board shows six columns with a card for every candidate", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/pipeline?job=${job.id}`);
  for (const name of COLUMNS) await expect(column(page, name)).toBeVisible();
  await expect(column(page, "Shortlisted").getByRole("article").filter({ hasText: "Ali Raza" })).toBeVisible();
  await expect(column(page, "Applied").getByRole("article").filter({ hasText: "Ayesha Malik" })).toBeVisible();
  await expect(card(page, "Ali Raza").getByText("74", { exact: true })).toBeVisible();
  await expect(card(page, "Ali Raza").getByText(/Applied (today|\d+ days? ago)/)).toBeVisible();
});

test("dragging Ali to Interview moves him, saves history, and Ali sees Interview", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/pipeline?job=${job.id}`);
  await dragCard(page, "Ali Raza", "Interview");
  await expect(page.getByText("Ali Raza moved to Interview")).toBeVisible();
  await expect(column(page, "Interview").getByRole("article").filter({ hasText: "Ali Raza" })).toBeVisible();

  const [saved] = (await findApplications(ali.id)).filter((row) => row.id === aliApplication.id);
  expect(saved.status).toBe("interview");
  expect(saved.status_history.some((row) => row.from_status === "shortlisted" && row.to_status === "interview")).toBe(true);

  // Ali sees the change in My Applications, never his score.
  await openWithSession(page, aliCookies, `/my-applications/${aliApplication.id}`);
  await expect(page.getByText("Interview").first()).toBeVisible();
  await expect(page.locator("main")).not.toContainText("74");
});

test("the status dropdown moves a card the same way as a drag", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/pipeline?job=${job.id}`);
  await page.getByLabel("Move Ali Raza to").selectOption({ label: "Offer" });
  await expect(page.getByText("Ali Raza moved to Offer")).toBeVisible();
  await expect(column(page, "Offer").getByRole("article").filter({ hasText: "Ali Raza" })).toBeVisible();
  expect((await findApplication(aliApplication.id)).status).toBe("offer");
});

test("moving to Hired or Rejected asks for confirmation first", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/pipeline?job=${job.id}`);
  await page.getByLabel("Move Ali Raza to").selectOption({ label: "Hired" });
  const dialog = page.getByRole("alertdialog");
  await expect(dialog.getByText("Move Ali Raza to Hired?")).toBeVisible();
  expect((await findApplication(aliApplication.id)).status).toBe("offer");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(column(page, "Offer").getByRole("article").filter({ hasText: "Ali Raza" })).toBeVisible();

  await dragCard(page, "Ali Raza", "Hired");
  await page.getByRole("alertdialog").getByRole("button", { name: "Move to Hired" }).click();
  await expect(page.getByText("Ali Raza moved to Hired")).toBeVisible();
  expect((await findApplication(aliApplication.id)).status).toBe("hired");

  await page.getByLabel("Move Ayesha Malik to").selectOption({ label: "Rejected" });
  await expect(page.getByRole("alertdialog").getByText("Reject Ayesha Malik?")).toBeVisible();
});

test("a failed move puts the card back and shows Couldn't move this candidate, try again", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/pipeline?job=${job.id}`);
  // The connection drops: every save to the server fails.
  await page.route("**/hr/pipeline**", (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
  await dragCard(page, "Ayesha Malik", "Shortlisted");
  await expect(page.getByText("Couldn't move this candidate, try again")).toBeVisible();
  await expect(column(page, "Applied").getByRole("article").filter({ hasText: "Ayesha Malik" })).toBeVisible();
  expect((await findApplication(ayeshaApplication.id)).status).toBe("applied");
});

test("a withdrawn candidate's card is greyed out and cannot be moved", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/pipeline?job=${job.id}`);
  const usman = card(page, "Usman Tariq");
  await expect(usman.getByText("This candidate has withdrawn")).toBeVisible();
  await expect(usman).toHaveAttribute("data-withdrawn", "true");
  await expect(usman).toHaveAttribute("draggable", "false");
  await expect(page.getByLabel("Move Usman Tariq to")).toBeDisabled();
});

test("Privacy: a candidate who opens the board URL sees You don't have access to this page", async ({ page }) => {
  await openWithSession(page, aliCookies, `/hr/pipeline?job=${job.id}`);
  await expect(page.getByText("You don't have access to this page")).toBeVisible();
});
