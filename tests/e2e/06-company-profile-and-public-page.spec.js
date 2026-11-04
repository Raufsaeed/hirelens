import { test, expect } from "@playwright/test";
import { testEmail, createAccount, createJob, createApplication, getCompany, deleteAccounts } from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";
import { bigPngFile, pngFile } from "./helpers/files";

// Feature 06 · Company Profile and Public Page. Dummy data is deleted after the run.

test.describe.configure({ mode: "serial" });

const createdEmails = [];
let sara;
let saraCookies;
let aliCookies;
let company;
let openJob;

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-company");
  const aliEmail = testEmail("ali-company");
  createdEmails.push(saraEmail, aliEmail);
  sara = await createAccount({ role: "hr", fullName: "Sara Khan", email: saraEmail, companyName: "ABC Tech" });
  const ali = await createAccount({ role: "candidate", fullName: "Ali Raza", email: aliEmail });
  openJob = await createJob(sara.companyId, { title: "Junior Web Developer" });
  await createJob(sara.companyId, { title: "Draft Designer", status: "draft", slug: null });
  await createJob(sara.companyId, {
    title: "Closed Analyst",
    status: "closed",
    closed_reason: "manual",
    closed_at: new Date().toISOString(),
  });
  await createApplication({ job: openJob, candidate: { ...ali, fullName: "Ali Raza" } });
  company = await getCompany(sara.companyId);
  saraCookies = await sessionCookies(browser, saraEmail);
  aliCookies = await sessionCookies(browser, aliEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

test("Sara saves About us, website and location and sees Company updated", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/company");
  await expect(page.getByLabel("Company name")).toHaveValue("ABC Tech");
  await page.getByLabel(/About us/).fill("A small, friendly team in Lahore building web apps.");
  await page.getByLabel("Website").fill("https://abctech.example.com");
  await page.getByLabel("Location").fill("Lahore");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Company updated")).toBeVisible();

  const saved = await getCompany(sara.companyId);
  expect(saved).toMatchObject({ about: expect.stringContaining("friendly team"), website: "https://abctech.example.com", location: "Lahore" });
});

test("abctech as the website and a too-long About us are refused", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/company");
  await page.getByLabel("Website").fill("abctech");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Please enter a valid website, for example https://abctech.com")).toBeVisible();

  await page.getByLabel("Website").fill("https://abctech.example.com");
  await page.getByLabel(/About us/).fill("x".repeat(1001));
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("About us can be up to 1,000 characters")).toBeVisible();
  expect((await getCompany(sara.companyId)).about).toContain("friendly team");
});

test("a PNG logo under 2 MB uploads and replaces the old one; a 3 MB logo is refused", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/company");
  await page.locator('input[type="file"]').setInputFiles(pngFile());
  await expect(page.getByText("Logo updated")).toBeVisible();
  const first = (await getCompany(sara.companyId)).logo_url;
  expect(first).toContain(`/logos/${sara.companyId}/logo.png`);

  await page.locator('input[type="file"]').setInputFiles(pngFile("new-logo.png"));
  await expect(page.getByText("Logo updated")).toBeVisible();
  const second = (await getCompany(sara.companyId)).logo_url;
  expect(second).not.toBe(first);

  await page.locator('input[type="file"]').setInputFiles(bigPngFile());
  await expect(page.getByText("Logo must be a PNG or JPG under 2 MB")).toBeVisible();
  expect((await getCompany(sara.companyId)).logo_url).toBe(second);
});

test("changing the company name keeps the page address", async ({ page }) => {
  await openWithSession(page, saraCookies, "/hr/company");
  await page.getByLabel("Company name").fill("ABC Technologies");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Company updated")).toBeVisible();
  const saved = await getCompany(sara.companyId);
  expect(saved.name).toBe("ABC Technologies");
  expect(saved.slug).toBe(company.slug);
  await expect(page.getByRole("link", { name: "View company page" })).toHaveAttribute("href", `/companies/${company.slug}`);
});

test("the public page shows the details and only Open jobs, with no private data", async ({ browser }) => {
  const visitor = await browser.newPage();
  await visitor.goto(`/companies/${company.slug}`);
  await expect(visitor.getByRole("heading", { level: 1, name: "ABC Technologies" })).toBeVisible();
  await expect(visitor.getByText("A small, friendly team in Lahore building web apps.")).toBeVisible();
  const website = visitor.getByRole("link", { name: "abctech.example.com" });
  await expect(website).toHaveAttribute("target", "_blank");
  await expect(visitor.getByText("Lahore").first()).toBeVisible();
  await expect(visitor.getByRole("img", { name: "ABC Technologies logo" })).toBeVisible();

  await expect(visitor.getByRole("article").filter({ hasText: "Junior Web Developer" })).toBeVisible();
  await expect(visitor.getByText("Draft Designer")).toHaveCount(0);
  await expect(visitor.getByText("Closed Analyst")).toHaveCount(0);

  const text = await visitor.locator("main").innerText();
  expect(text).not.toMatch(/Sara|applicant|Ali Raza/i);
  await visitor.close();
});

test("clicking the company on a job page opens the company page; unknown slugs are not found", async ({ page }) => {
  await page.goto(`/jobs/${openJob.slug}`);
  await page.getByRole("link", { name: "ABC Technologies" }).click();
  await expect(page).toHaveURL(new RegExp(`/companies/${company.slug}$`));

  await page.goto("/companies/unknown-company");
  await expect(page.getByText("This company could not be found")).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse jobs" })).toBeVisible();
});

test("Privacy: a candidate who opens Company Settings sees You don't have access to this page", async ({ page }) => {
  await openWithSession(page, aliCookies, "/hr/company");
  await expect(page.getByText("You don't have access to this page")).toBeVisible();
  await expect(page.getByLabel("Company name")).toHaveCount(0);
});
