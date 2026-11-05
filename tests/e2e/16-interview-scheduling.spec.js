import { test, expect } from "@playwright/test";
import {
  testEmail,
  createAccount,
  createJob,
  createApplication,
  createInterview,
  findApplication,
  findInterviews,
  deleteAccounts,
  pakistanDate,
} from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";

// Feature 16 · Interview Scheduling. Dummy accounts and data are deleted after the run.

test.describe.configure({ mode: "serial" });

const LINK = "https://meet.google.com/abc-defg-hij";
const DAY = pakistanDate(4);
const createdEmails = [];
let saraCookies;
let aliCookies;
let job;
let ali;
let ayesha;
let bilal;

// "7 Nov" for a YYYY-MM-DD date, as the app shows it.
function dayLabel(date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`)
  );
}

async function applicant(fullName, status = "shortlisted") {
  const email = testEmail(fullName.split(" ")[0].toLowerCase());
  createdEmails.push(email);
  const account = await createAccount({ role: "candidate", fullName, email });
  const application = await createApplication({ job, candidate: { ...account, fullName }, status });
  return { account, application, email };
}

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-interviews");
  createdEmails.push(saraEmail);
  const sara = await createAccount({ role: "hr", fullName: "Sara Khan", email: saraEmail, companyName: "ABC Tech" });
  job = await createJob(sara.companyId, { title: "Junior Web Developer" });
  ali = await applicant("Ali Raza");
  ayesha = await applicant("Ayesha Malik", "interview");
  bilal = await applicant("Bilal Ahmed");
  // Ayesha already has an interview with Sara at 11:00 on DAY, and one in the past.
  await createInterview(ayesha.application.id, { date: DAY, time: "11:00", interviewerName: "Sara Khan" });
  await createInterview(ayesha.application.id, { date: pakistanDate(-3), time: "15:00", interviewerName: "Sara Khan" });

  saraCookies = await sessionCookies(browser, saraEmail);
  aliCookies = await sessionCookies(browser, ali.email);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

const column = (page, name) => page.getByRole("region", { name: `${name} column` });
const card = (page, name) => page.getByRole("article").filter({ hasText: name });

// Opens the pipeline and moves a card to Interview with its Move to menu.
async function openScheduleForm(page, name) {
  await openWithSession(page, saraCookies, `/hr/pipeline?job=${job.id}`);
  await page.getByLabel(`Move ${name} to`).selectOption("interview");
  const form = page.getByRole("dialog");
  await expect(form.getByText(`Schedule interview with ${name}`)).toBeVisible();
  return form;
}

async function fillForm(form, { date = DAY, time = "11:00", link = LINK, address = "" } = {}) {
  await form.getByLabel("Date").fill(date);
  await form.getByLabel("Time").fill(time);
  await form.getByLabel("Meeting link").fill(link);
  await form.getByLabel("Office address").fill(address);
}

test("a past date shows Please choose a date in the future and nothing is saved", async ({ page }) => {
  const form = await openScheduleForm(page, "Bilal Ahmed");
  await expect(form.getByLabel("Duration")).toHaveValue("30");
  await fillForm(form, { date: pakistanDate(-1) });
  await form.getByRole("button", { name: "Save interview" }).click();
  await expect(form.getByText("Please choose a date in the future")).toBeVisible();

  // Cancel keeps Bilal where he was.
  await form.getByRole("button", { name: "Cancel" }).click();
  await expect(column(page, "Shortlisted").getByRole("article").filter({ hasText: "Bilal Ahmed" })).toBeVisible();
  expect(await findInterviews(bilal.application.id)).toHaveLength(0);
  expect((await findApplication(bilal.application.id)).status).toBe("shortlisted");
});

test("no link or address, or a broken link, is explained", async ({ page }) => {
  const form = await openScheduleForm(page, "Bilal Ahmed");
  await fillForm(form, { link: "" });
  await form.getByRole("button", { name: "Save interview" }).click();
  await expect(form.getByText("Add a meeting link or an office address")).toBeVisible();

  await form.getByLabel("Meeting link").fill("meet google abc");
  await form.getByRole("button", { name: "Save interview" }).click();
  await expect(form.getByText("Please enter a valid link")).toBeVisible();
  expect(await findInterviews(bilal.application.id)).toHaveLength(0);
});

test("a clash with the same interviewer is shown, and Schedule anyway saves it", async ({ page }) => {
  const form = await openScheduleForm(page, "Bilal Ahmed");
  await fillForm(form, { time: "11:15" });
  await form.getByLabel("Interviewer name").fill("Sara Khan");
  await form.getByRole("button", { name: "Save interview" }).click();
  await expect(form.getByText("You already have an interview at this time")).toBeVisible();
  await expect(form.getByText(/Ayesha Malik/)).toBeVisible();
  expect(await findInterviews(bilal.application.id)).toHaveLength(0);

  await form.getByRole("button", { name: "Schedule anyway" }).click();
  await expect(page.getByText("Bilal Ahmed moved to Interview")).toBeVisible();
  expect(await findInterviews(bilal.application.id)).toHaveLength(1);
});

test("moving Ali to Interview and saving shows the details in his My Applications", async ({ page }) => {
  const form = await openScheduleForm(page, "Ali Raza");
  await fillForm(form, { time: "14:00", address: "ABC Tech, 12 Main Boulevard, Lahore" });
  await form.getByLabel("Interviewer name").fill("Hamza");
  await form.getByRole("button", { name: "Save interview" }).click();

  await expect(page.getByText("Interview scheduled")).toBeVisible();
  const aliCard = column(page, "Interview").getByRole("article").filter({ hasText: "Ali Raza" });
  await expect(aliCard.getByText(`${dayLabel(DAY)}, 2:00 pm`)).toBeVisible();

  const saved = await findApplication(ali.application.id);
  expect(saved.status).toBe("interview");
  const [interview] = await findInterviews(ali.application.id);
  expect(interview).toMatchObject({ status: "scheduled", duration_minutes: 30, meeting_link: LINK, interviewer_name: "Hamza" });

  await openWithSession(page, aliCookies, `/my-applications/${ali.application.id}`);
  const details = page.getByRole("region", { name: "Interview details" });
  await expect(details.getByText(`${dayLabel(DAY)}, 2:00 pm`)).toBeVisible();
  await expect(details.getByText("30 minutes")).toBeVisible();
  await expect(details.getByRole("link", { name: LINK })).toHaveAttribute("href", LINK);
  await expect(details.getByText("ABC Tech, 12 Main Boulevard, Lahore")).toBeVisible();
});

test("the Interviews page lists upcoming (soonest first) and past interviews", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/interviews");
  const upcoming = page.getByRole("region", { name: "Upcoming interviews" });
  const past = page.getByRole("region", { name: "Past interviews" });
  const rows = upcoming.getByRole("listitem");
  await expect(rows).toHaveCount(3);
  // Ayesha 11:00, Bilal 11:15, Ali 14:00 on the same day.
  await expect(rows.nth(0)).toContainText("Ayesha Malik");
  await expect(rows.nth(1)).toContainText("Bilal Ahmed");
  await expect(rows.nth(2)).toContainText("Ali Raza");
  await expect(rows.nth(2)).toContainText("Junior Web Developer");
  await expect(rows.nth(2)).toContainText("Scheduled");
  await expect(past.getByRole("listitem")).toHaveCount(1);
  await expect(past.getByRole("listitem").first()).toContainText("Ayesha Malik");
});

test("rescheduling updates what Ali sees, and cancelling shows Interview cancelled", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/interviews");
  const aliRow = page.getByRole("region", { name: "Upcoming interviews" }).getByRole("listitem").filter({ hasText: "Ali Raza" });
  await aliRow.getByRole("button", { name: "Reschedule" }).click();
  const form = page.getByRole("dialog");
  await expect(form.getByLabel("Time")).toHaveValue("14:00");
  await form.getByLabel("Time").fill("16:30");
  await form.getByRole("button", { name: "Save interview" }).click();
  await expect(page.getByText("Interview updated")).toBeVisible();
  await expect(aliRow).toContainText(`${dayLabel(DAY)}, 4:30 pm`);

  await openWithSession(page, aliCookies, `/my-applications/${ali.application.id}`);
  await expect(page.getByRole("region", { name: "Interview details" }).getByText(`${dayLabel(DAY)}, 4:30 pm`)).toBeVisible();

  await openWithSession(page, saraCookies, "/hr/interviews");
  await aliRow.getByRole("button", { name: "Cancel interview" }).click();
  // A destructive confirm is an alertdialog.
  await page.getByRole("alertdialog").getByRole("button", { name: "Cancel interview" }).click();
  await expect(page.getByText("Interview cancelled").first()).toBeVisible();
  const [interview] = await findInterviews(ali.application.id);
  expect(interview.status).toBe("cancelled");

  await openWithSession(page, aliCookies, `/my-applications/${ali.application.id}`);
  await expect(page.getByRole("region", { name: "Interview details" }).getByText("Interview cancelled")).toBeVisible();
  await expect(page.getByRole("link", { name: LINK })).toHaveCount(0);
});
