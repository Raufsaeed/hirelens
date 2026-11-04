import { test, expect } from "@playwright/test";
import {
  testEmail,
  createAccount,
  createJob,
  createApplication,
  setScreening,
  deleteAccounts,
} from "./helpers/test-accounts";
import { sessionCookies, openWithSession } from "./helpers/session";

// Feature 12 · Ranked Candidates List. Screenings are saved directly (no AI). Dummy data is deleted after.

test.describe.configure({ mode: "serial" });

const createdEmails = [];
let saraCookies;
let job;

const PEOPLE = [
  { name: "Ayesha Malik", score: 88, match: 100, years: 2.5, degree: "BS CS", degreeMatch: true, status: "shortlisted", react: true },
  { name: "Ali Raza", score: 74, match: 80, years: 1.3, degree: "BS CS", degreeMatch: true, status: "applied", react: true },
  { name: "Usman Tariq", score: 61, match: 60, years: 0.5, degree: "BS IT", degreeMatch: false, status: "applied", react: false },
];

test.beforeAll(async ({ browser }) => {
  const saraEmail = testEmail("sara-ranked");
  createdEmails.push(saraEmail);
  const sara = await createAccount({ role: "hr", fullName: "Sara", email: saraEmail, companyName: "ABC Tech" });
  job = await createJob(sara.companyId, { title: "Junior Web Developer" });

  // Usman applies first and Ayesha last, so the order can't come from applied dates.
  for (const person of [...PEOPLE].reverse()) {
    const email = testEmail(person.name.split(" ")[0].toLowerCase());
    createdEmails.push(email);
    const account = await createAccount({ role: "candidate", fullName: person.name, email });
    const application = await createApplication({
      job,
      candidate: { ...account, fullName: person.name },
      status: person.status,
    });
    await setScreening(application.id, {
      score: person.score,
      match_percent: person.match,
      relevant_years: person.years,
      degree_found: person.degree,
      degree_match: person.degreeMatch,
      requirements_result: [
        { name: "HTML", type: "must", found: true, evidence: "HTML" },
        { name: "React", type: "must", found: person.react, evidence: person.react ? "React" : "" },
        { name: "REST APIs", type: "nice", found: false, evidence: "" },
      ],
    });
  }

  // Hira's screening is pending: she stays at the bottom with a badge.
  const hiraEmail = testEmail("hira-ranked");
  createdEmails.push(hiraEmail);
  const hira = await createAccount({ role: "candidate", fullName: "Hira Ahmed", email: hiraEmail });
  const pending = await createApplication({ job, candidate: { ...hira, fullName: "Hira Ahmed" } });
  await setScreening(pending.id, { error_message: "AI screening failed (test)", screening_status: "pending" });

  saraCookies = await sessionCookies(browser, saraEmail);
});

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

async function names(page) {
  return page.locator("tbody tr td:nth-child(2)").allInnerTexts();
}

test("candidates appear ranked Ayesha (88), Ali (74), Usman (61) with match, years and degree", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/candidates?job=${job.id}`);
  expect(await names(page)).toEqual(["Ayesha Malik", "Ali Raza", "Usman Tariq", "Hira Ahmed"]);

  const ali = page.getByRole("row").filter({ hasText: "Ali Raza" });
  await expect(ali.getByText("74", { exact: true })).toBeVisible();
  await expect(ali.getByText("80%")).toBeVisible();
  await expect(ali.getByText("1.3", { exact: true })).toBeVisible();
  await expect(ali.getByText("BS CS")).toBeVisible();
  await expect(ali.getByText("matches the required degree")).toBeAttached();

  const usman = page.getByRole("row").filter({ hasText: "Usman Tariq" });
  await expect(usman.getByText("doesn't match the required degree")).toBeAttached();

  // Pending at the bottom with its badge.
  const hira = page.getByRole("row").filter({ hasText: "Hira Ahmed" });
  await expect(hira.getByText("Pending", { exact: true })).toBeVisible();
  await expect(page.getByText("4 of 4 candidates match")).toBeVisible();
});

test("filters for score, years, skill and status work together and show a match count", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/candidates?job=${job.id}`);
  await page.getByLabel("Minimum score").fill("70");
  expect(await names(page)).toEqual(["Ayesha Malik", "Ali Raza"]);
  await expect(page.getByText("2 of 4 candidates match")).toBeVisible();

  await page.getByLabel("Experience").selectOption({ label: "At least 2 years" });
  expect(await names(page)).toEqual(["Ayesha Malik"]);

  await page.getByLabel("Experience").selectOption({ label: "Any experience" });
  await page.getByLabel("Status").selectOption({ label: "Applied" });
  expect(await names(page)).toEqual(["Ali Raza"]);

  await page.getByLabel("Minimum score").fill("0");
  await page.getByLabel("Skill").selectOption({ label: "React" });
  expect(await names(page)).toEqual(["Ali Raza"]);
  await expect(page.getByText("1 of 4 candidates match")).toBeVisible();

  // Opening another candidate still works while Hira is pending.
  await page.getByRole("link", { name: "Ali Raza" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Ali Raza" })).toBeVisible();
});

test("a minimum score of 95 shows No candidates match these filters with Clear filters", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/candidates?job=${job.id}`);
  await page.getByLabel("Minimum score").fill("95");
  await expect(page.getByText("No candidates match these filters")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  expect(await names(page)).toHaveLength(4);
});

test("the anonymised view hides names in the list", async ({ page }) => {
  await openWithSession(page, saraCookies, `/hr/candidates?job=${job.id}`);
  await page.getByRole("switch", { name: "Hide names" }).check();
  expect(await names(page)).toEqual(["Candidate #1", "Candidate #2", "Candidate #3", "Candidate #4"]);
  await expect(page.locator("tbody")).not.toContainText("Ayesha");
});

test("Privacy: Sara only sees candidates who applied to ABC Tech jobs", async ({ page, browser }) => {
  const email = testEmail("other-ranked");
  createdEmails.push(email);
  const other = await createAccount({ role: "hr", fullName: "Omar", email, companyName: "XYZ Labs" });
  await createJob(other.companyId, { title: "XYZ Designer" });
  const cookies = await sessionCookies(browser, email);

  // Another company's HR with ABC Tech's job id in the URL: no access, and no ABC Tech data.
  await openWithSession(page, cookies, `/hr/candidates?job=${job.id}`);
  await expect(page.getByText("You don't have access to this page")).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Ayesha");
  await expect(page.locator("main")).not.toContainText("Junior Web Developer");
});
