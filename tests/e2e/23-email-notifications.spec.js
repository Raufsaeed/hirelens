import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import {
  testEmail,
  createAccount,
  createJob,
  createApplication,
  createInterview,
  findApplications,
  setScreening,
  deleteAccounts,
  pakistanDate,
} from "./helpers/test-accounts";
import { capturedEmails, emailCookie, openWithSession, sessionCookies } from "./helpers/session";
import { pdfFile } from "./helpers/files";

// Feature 23 · Email Notifications. Emails are captured to a temp file ("capture" mode), never sent.
// Dummy accounts and data are deleted after the run.

test.describe.configure({ mode: "serial" });

const NOTE = "Strong React portfolio, ask about REST APIs";
const SUMMARY = "Builds React pages with HTML and CSS";
const createdEmails = [];
let sara;
let saraEmail;
let saraCookies;
let ali;
let aliEmail;
let aliCookies;
let webJob;
let reactJob;
let aliApplication;

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function notificationsFor(userId, type) {
  const { data, error } = await admin().from("notifications").select("*").eq("user_id", userId).eq("type", type);
  if (error) throw error;
  return data;
}

// Waits for an email to arrive (emails go out just after the action finishes).
async function waitForEmail(to, match) {
  await expect.poll(async () => (await capturedEmails(to)).some(match), { timeout: 15000 }).toBe(true);
  return (await capturedEmails(to)).filter(match).at(-1);
}

// Nothing secret may appear in any email: no score, match percentage, AI summary or HR note.
function expectNoPrivateData(email) {
  const text = `${email.subject}\n${email.html}\n${email.text}`;
  expect(text).not.toMatch(/score|match|%|\b74\b/i);
  expect(text).not.toContain(SUMMARY);
  expect(text).not.toContain(NOTE);
}

test.beforeAll(async ({ browser }) => {
  test.setTimeout(120 * 1000);
  saraEmail = testEmail("sara-email");
  aliEmail = testEmail("ali-email");
  createdEmails.push(saraEmail, aliEmail);
  sara = await createAccount({ role: "hr", fullName: "Sara Khan", email: saraEmail, companyName: "ABC Tech" });
  ali = await createAccount({ role: "candidate", fullName: "Ali Raza", email: aliEmail });
  webJob = await createJob(sara.companyId, { title: "Junior Web Developer", apply_by: pakistanDate(10) });
  reactJob = await createJob(sara.companyId, { title: "React Developer", apply_by: pakistanDate(10) });
  saraCookies = await sessionCookies(browser, saraEmail);
  aliCookies = await sessionCookies(browser, aliEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

test("applying sends Your application to ABC Tech was received with a button to My Applications", async ({ page }) => {
  await openWithSession(page, aliCookies, `/jobs/${reactJob.slug}/apply`);
  await page.getByLabel("Phone").fill("0300 1234567");
  await page.locator('input[type="file"]').setInputFiles(pdfFile("ali-cv.pdf"));
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByRole("heading", { name: "Your application has been sent to ABC Tech" })).toBeVisible();

  const email = await waitForEmail(aliEmail, (item) => item.subject === "Your application to ABC Tech was received");
  expect(email.html).toContain("/my-applications");
  expect(email.html).toContain("My Applications");
  expectNoPrivateData(email);

  [aliApplication] = await findApplications(ali.id);
  // Ali's screening score is 74, and Sara wrote a note; neither may ever be emailed.
  await setScreening(aliApplication.id, { score: 74, match_percent: 67, summary: [SUMMARY, "Line two", "Line three"] });
  await admin().from("notes").insert({ application_id: aliApplication.id, author_id: sara.id, author_name: "Sara Khan", body: NOTE });
  expect(await notificationsFor(ali.id, "application_received")).toMatchObject([{ status: "sent" }]);
});

test("scheduling an interview emails Ali the date, time, duration and meeting link", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/pipeline?job=${reactJob.id}`);
  await page.getByLabel("Move Ali Raza to").selectOption("interview");
  const form = page.getByRole("dialog");
  await form.getByLabel("Date").fill(pakistanDate(3));
  await form.getByLabel("Time").fill("14:00");
  await form.getByLabel("Meeting link").fill("https://meet.google.com/abc-defg-hij");
  await form.getByRole("button", { name: "Save interview" }).click();
  await expect(page.getByText(/Interview scheduled/).first()).toBeVisible();

  const email = await waitForEmail(aliEmail, (item) => /interview/i.test(item.subject) && /scheduled/i.test(item.subject));
  expect(email.text).toContain("2:00 pm");
  expect(email.text).toContain("30 minutes");
  expect(email.text).toContain("https://meet.google.com/abc-defg-hij");
  expectNoPrivateData(email);
});

test("with status updates off, no status email is sent but interview emails still arrive", async ({ page }) => {
  await openWithSession(page, aliCookies, "/settings");
  const toggle = page.getByRole("switch", { name: "Status updates" });
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(page.getByText("Preference saved")).toBeVisible();
  await expect(toggle).not.toBeChecked();

  const before = (await capturedEmails(aliEmail)).length;
  await openWithSession(page, saraCookies, `/hr/pipeline?job=${reactJob.id}`);
  await page.getByLabel("Move Ali Raza to").selectOption("shortlisted");
  await expect(page.getByRole("region", { name: "Shortlisted column" }).getByText("Ali Raza")).toBeVisible();

  // An interview change still sends an email.
  const interview = await createInterview(aliApplication.id, { date: pakistanDate(4), time: "10:00" });
  await openWithSession(page, saraCookies, "/hr/interviews");
  const row = page.getByRole("region", { name: "Upcoming interviews" }).getByRole("listitem").filter({ hasText: "Ali Raza" });
  await row.first().getByRole("button", { name: "Cancel interview" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: /Cancel interview/ }).click();
  await waitForEmail(aliEmail, (item) => /cancelled/i.test(item.subject));

  const statusEmails = (await capturedEmails(aliEmail)).slice(before).filter((item) => item.subject.startsWith("Update on your application"));
  expect(statusEmails).toHaveLength(0);
  expect(interview.id).toBeTruthy();

  // Turn status updates back on for the next test.
  await openWithSession(page, aliCookies, "/settings");
  await page.getByRole("switch", { name: "Status updates" }).click();
  await expect(page.getByText("Preference saved")).toBeVisible();
});

test("if Resend is unavailable, the move still succeeds and the email is logged as failed", async ({ page }) => {
  await openWithSession(page, [...saraCookies, ...emailCookie("fail")], `/hr/pipeline?job=${reactJob.id}`);
  await page.getByLabel("Move Ali Raza to").selectOption("offer");
  await expect(page.getByRole("region", { name: "Offer column" }).getByText("Ali Raza")).toBeVisible();

  await expect.poll(async () => (await notificationsFor(ali.id, "status_changed")).some((row) => row.status === "failed")).toBe(true);
  const failed = (await notificationsFor(ali.id, "status_changed")).find((row) => row.status === "failed");
  expect(failed.error_message).toBeTruthy();

  await openWithSession(page, aliCookies, "/my-applications");
  await expect(page.getByText("Offer").first()).toBeVisible();
});

test("a status change emails Update on your application to ABC Tech with no private data", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/pipeline?job=${reactJob.id}`);
  await page.getByLabel("Move Ali Raza to").selectOption("shortlisted");
  const email = await waitForEmail(aliEmail, (item) => item.subject === "Update on your application to ABC Tech");
  expect(email.html).toContain("/my-applications");
  expectNoPrivateData(email);
});

test("Send today's summary emails Sara one summary listing Junior Web Developer · 5 new", async ({ page }) => {
  test.setTimeout(120 * 1000);
  for (const name of ["Hina", "Usman", "Zara", "Bilal", "Nadia"]) {
    const email = testEmail(`${name.toLowerCase()}-email`);
    createdEmails.push(email);
    const candidate = await createAccount({ role: "candidate", fullName: name, email });
    const application = await createApplication({ job: webJob, candidate: { ...candidate, fullName: name } });
    await setScreening(application.id, { score: 74, summary: [SUMMARY, "Two", "Three"] });
  }

  await openWithSession(page, saraCookies, "/hr/dashboard");
  await page.getByRole("button", { name: "Send today's summary" }).click();
  await expect(page.getByText("Summary sent")).toBeVisible();

  const summaries = (await capturedEmails(saraEmail)).filter((item) => /summary|new applicants/i.test(item.subject));
  expect(summaries).toHaveLength(1);
  expect(summaries[0].text).toContain("Junior Web Developer · 5 new");
  expect(summaries[0].html).toContain("/hr/candidates");
  expectNoPrivateData(summaries[0]);
  expect(summaries[0].text).not.toContain("Hina");
});

test("with no new applicants, Sara sees No new applicants since the last summary and no email", async ({ page }) => {
  const before = (await capturedEmails(saraEmail)).length;
  await openWithSession(page, saraCookies, "/hr/dashboard");
  await page.getByRole("button", { name: "Send today's summary" }).click();
  await expect(page.getByText("No new applicants since the last summary")).toBeVisible();
  expect(await capturedEmails(saraEmail)).toHaveLength(before);
});

test("if the summary fails to send, Sara sees Couldn't send the summary, try again", async ({ page }) => {
  const email = testEmail("omar-email");
  createdEmails.push(email);
  const candidate = await createAccount({ role: "candidate", fullName: "Omar", email });
  await createApplication({ job: webJob, candidate: { ...candidate, fullName: "Omar" } });

  await openWithSession(page, [...saraCookies, ...emailCookie("fail")], "/hr/dashboard");
  await page.getByRole("button", { name: "Send today's summary" }).click();
  await expect(page.getByText("Couldn't send the summary, try again")).toBeVisible();
  expect((await notificationsFor(sara.id, "daily_summary")).some((row) => row.status === "failed")).toBe(true);
});

test("with Daily applicant summary turned off, no summary email is sent", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/settings");
  await page.getByRole("switch", { name: "Daily applicant summary" }).click();
  await expect(page.getByText("Preference saved")).toBeVisible();

  const before = (await capturedEmails(saraEmail)).length;
  await openWithSession(page, saraCookies, "/hr/dashboard");
  await page.getByRole("button", { name: "Send today's summary" }).click();
  await expect(page.getByText("Daily applicant summary is turned off in Settings")).toBeVisible();
  expect(await capturedEmails(saraEmail)).toHaveLength(before);
});
