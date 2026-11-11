import { test, expect } from "@playwright/test";
import { testEmail, createAccount, createJob, findApplications, pakistanDate, deleteAccounts } from "./helpers/test-accounts";
import { capturedEmails, openWithSession, sessionCookies } from "./helpers/session";
import { pdfFile } from "./helpers/files";

// Deploying on Vercel: links in emails come from NEXT_PUBLIC_SITE_URL (localhost when it isn't set),
// never from the request's headers, which anyone can fake. Uses dummy accounts deleted after the run.

// The same value the dev server uses (playwright.config.js loads .env.local), without reading it here.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
const FAKE_SITE = "https://evil.example";

const createdEmails = [];
let ali;
let aliCookies;
let job;

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-vercel");
  const aliEmail = testEmail("ali-vercel");
  createdEmails.push(saraEmail, aliEmail);
  const sara = await createAccount({ role: "hr", fullName: "Sara", email: saraEmail, companyName: "ABC Tech" });
  ali = await createAccount({ role: "candidate", fullName: "Ali Raza", email: aliEmail });
  aliCookies = await sessionCookies(browser, aliEmail);
  job = await createJob(sara.companyId, { title: "Junior Web Developer", apply_by: pakistanDate(5) });
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

test("email links use the site URL, even when the request's Origin and Host headers are faked", async ({ page }) => {
  await openWithSession(page, aliCookies, "/my-applications");
  const response = await page.request.post("/api/applications", {
    headers: { origin: FAKE_SITE, "x-forwarded-host": "evil.example", "x-forwarded-proto": "https" },
    multipart: {
      jobId: job.id,
      fullName: "Ali Raza",
      email: ali.email,
      phone: "0300 1234567",
      cv: pdfFile("ali-cv.pdf"),
    },
  });
  expect(response.status()).toBe(201);
  expect(await findApplications(ali.id)).toHaveLength(1);

  // "Your application was received" goes out just after the response.
  await expect.poll(async () => (await capturedEmails(ali.email)).length, { timeout: 15000 }).toBeGreaterThan(0);
  const email = JSON.stringify((await capturedEmails(ali.email)).at(-1));
  expect(email).toContain(`${SITE_URL}/my-applications`);
  expect(email).not.toContain("evil.example");
});
