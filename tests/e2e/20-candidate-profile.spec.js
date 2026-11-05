import { test, expect } from "@playwright/test";
import {
  testEmail,
  createAccount,
  createJob,
  findApplications,
  getProfile,
  readCvText,
  clearDefaultCv,
  deleteAccounts,
  pakistanDate,
} from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";
import { docxFile, pdfFile } from "./helpers/files";

// Feature 20 · Candidate Profile. Dummy accounts and data are deleted after the run.

test.describe.configure({ mode: "serial" });

const createdEmails = [];
let ali;
let aliEmail;
let aliCookies;
let saraCookies;
let firstJob;
let secondJob;
let thirdJob;

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-profile");
  aliEmail = testEmail("ali-profile");
  createdEmails.push(saraEmail, aliEmail);
  const sara = await createAccount({ role: "hr", fullName: "Sara Khan", email: saraEmail, companyName: "ABC Tech" });
  ali = await createAccount({ role: "candidate", fullName: "Ali Raza", email: aliEmail });
  firstJob = await createJob(sara.companyId, { title: "Junior Web Developer", apply_by: pakistanDate(5) });
  secondJob = await createJob(sara.companyId, { title: "React Developer", apply_by: pakistanDate(5) });
  thirdJob = await createJob(sara.companyId, { title: "Frontend Intern", apply_by: pakistanDate(5) });
  aliCookies = await sessionCookies(browser, aliEmail);
  saraCookies = await sessionCookies(browser, saraEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

const cvInput = (page) => page.locator('input[type="file"]');

async function openApplyForm(page, job) {
  await openWithSession(page, aliCookies, `/jobs/${job.slug}/apply`);
  await expect(page.getByRole("heading", { name: "Apply to ABC Tech" })).toBeVisible();
}

test("a new candidate sees Complete your profile to apply faster", async ({ page }) => {
  await openWithSession(page, aliCookies, "/my-applications");
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("link", { name: "My Profile" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText("Complete your profile to apply faster")).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("Ali Raza");
});

test("a headline over 100 characters is refused and nothing is saved", async ({ page }) => {
  await openWithSession(page, aliCookies, "/profile");
  await page.getByLabel("Headline").fill("x".repeat(101));
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Headline can be up to 100 characters")).toBeVisible();
  expect((await getProfile(ali.id)).headline).toBeNull();
});

test("Ali saves his phone, city and headline and sees Profile saved", async ({ page }) => {
  await openWithSession(page, aliCookies, "/profile");
  await page.getByLabel("Phone").fill("0300 1234567");
  await page.getByLabel("City").fill("Lahore");
  await page.getByLabel("Headline").fill("Junior React developer");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved")).toBeVisible();
  const profile = await getProfile(ali.id);
  expect(profile).toMatchObject({ phone: "0300 1234567", city: "Lahore", headline: "Junior React developer" });
});

test("Ali uploads ali-cv.pdf as his default CV and sees CV uploaded", async ({ page }) => {
  await openWithSession(page, aliCookies, "/profile");
  await cvInput(page).setInputFiles(pdfFile("ali-cv.pdf", ["Ali Raza", "Original default CV"]));
  await expect(page.getByText("CV uploaded")).toBeVisible();
  await expect(page.getByText("ali-cv.pdf")).toBeVisible();
  expect((await getProfile(ali.id)).default_cv_path).toBe(`${ali.id}/default/ali-cv.pdf`);
});

test("a .docx default CV shows Only PDF files are accepted and the old one stays", async ({ page }) => {
  await openWithSession(page, aliCookies, "/profile");
  await cvInput(page).setInputFiles(docxFile("ali-cv.docx"));
  await expect(page.getByText("Only PDF files are accepted")).toBeVisible();
  expect((await getProfile(ali.id)).default_cv_path).toBe(`${ali.id}/default/ali-cv.pdf`);
});

test("the apply form is prefilled and Use my default CV (ali-cv.pdf) is selected", async ({ page }) => {
  await openApplyForm(page, firstJob);
  await expect(page.getByLabel("Full name")).toHaveValue("Ali Raza");
  await expect(page.getByLabel("Email")).toHaveValue(aliEmail);
  await expect(page.getByLabel("Phone")).toHaveValue("0300 1234567");
  await expect(page.getByRole("radio", { name: "Use my default CV (ali-cv.pdf)" })).toBeChecked();

  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByRole("heading", { name: "Your application has been sent to ABC Tech" })).toBeVisible();
  const application = (await findApplications(ali.id)).find((item) => item.job_id === firstJob.id);
  // The default CV was copied into the application.
  expect(application.cv_file_path).toBe(`${ali.id}/applications/${firstJob.id}/ali-cv.pdf`);
  expect(await readCvText(application.cv_file_path)).toContain("Original default CV");
});

test("a different CV is used for one job only; the default stays ali-cv.pdf", async ({ page }) => {
  await openApplyForm(page, secondJob);
  await page.getByRole("radio", { name: "Upload a different CV for this job" }).check();
  await cvInput(page).setInputFiles(pdfFile("ali-react-cv.pdf", ["Ali Raza", "React focused CV"]));
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByRole("heading", { name: "Your application has been sent to ABC Tech" })).toBeVisible();

  const application = (await findApplications(ali.id)).find((item) => item.job_id === secondJob.id);
  expect(application.cv_file_path).toBe(`${ali.id}/applications/${secondJob.id}/ali-react-cv.pdf`);
  expect((await getProfile(ali.id)).default_cv_path).toBe(`${ali.id}/default/ali-cv.pdf`);
});

test("replacing the default CV does not change the CV Sara sees on the earlier application", async ({ page }) => {
  await openWithSession(page, aliCookies, "/profile");
  await page.getByRole("button", { name: "Replace" }).click();
  await cvInput(page).setInputFiles(pdfFile("ali-cv-2026.pdf", ["Ali Raza", "Newer default CV"]));
  await expect(page.getByText("CV uploaded")).toBeVisible();
  await expect(page.getByText("ali-cv-2026.pdf")).toBeVisible();
  expect((await getProfile(ali.id)).default_cv_path).toBe(`${ali.id}/default/ali-cv-2026.pdf`);

  const application = (await findApplications(ali.id)).find((item) => item.job_id === firstJob.id);
  expect(application.cv_file_path).toBe(`${ali.id}/applications/${firstJob.id}/ali-cv.pdf`);
  expect(await readCvText(application.cv_file_path)).toContain("Original default CV");

  // Sara still opens the original CV on that application.
  await openWithSession(page, saraCookies, `/hr/candidates/${application.id}`);
  const response = await page.request.get(`/hr/candidates/${application.id}/cv`);
  expect(response.ok()).toBe(true);
  expect((await response.body()).toString("latin1")).toContain("Original default CV");
});

test("Ali deletes his default CV after confirming; sent CVs stay", async ({ page }) => {
  await openWithSession(page, aliCookies, "/profile");
  await page.getByRole("button", { name: "Delete" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog.getByRole("heading", { name: "Delete your default CV?" })).toBeVisible();
  await expect(dialog.getByText("CVs you already sent to companies are not affected.")).toBeVisible();
  await dialog.getByRole("button", { name: "Delete CV" }).click();
  await expect(page.getByText("Default CV deleted")).toBeVisible();
  await expect(page.getByRole("button", { name: /Upload your CV/ })).toBeVisible();
  expect((await getProfile(ali.id)).default_cv_path).toBeNull();

  const application = (await findApplications(ali.id)).find((item) => item.job_id === firstJob.id);
  expect(await readCvText(application.cv_file_path)).toContain("Original default CV");
});

test("a default CV deleted while applying asks Ali to upload a CV", async ({ page }) => {
  await openWithSession(page, aliCookies, "/profile");
  await cvInput(page).setInputFiles(pdfFile("ali-cv.pdf"));
  await expect(page.getByText("CV uploaded")).toBeVisible();

  await openApplyForm(page, thirdJob);
  await expect(page.getByRole("radio", { name: "Use my default CV (ali-cv.pdf)" })).toBeChecked();
  await clearDefaultCv(ali.id);
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("Your default CV is no longer available. Please upload a CV")).toBeVisible();
  await expect(page.getByRole("button", { name: /Upload your CV/ })).toBeVisible();
  expect((await findApplications(ali.id)).some((item) => item.job_id === thirdJob.id)).toBe(false);
});

test("privacy: Sara opening the profile URL sees You don't have access to this page", async ({ page }) => {
  await openWithSession(page, saraCookies, "/profile");
  await expect(page.getByText("You don't have access to this page")).toBeVisible();
  await expect(page.getByText("Junior React developer")).toHaveCount(0);
  await expect(page.getByText("0300 1234567")).toHaveCount(0);
});
