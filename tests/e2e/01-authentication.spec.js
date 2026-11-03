import { test, expect } from "@playwright/test";
import {
  TEST_PASSWORD,
  testEmail,
  createAccount,
  findAccount,
  recoveryLink,
  deleteAccounts,
} from "./helpers/test-accounts";

// Feature 01 · Authentication. Uses dummy accounts that are deleted after the run.

const PASSWORD_ERROR =
  "Password must be at least 8 characters and include one capital letter and one special character (like @)";
const NEUTRAL_RESET = "If an account exists for this email, we've sent a reset link";
const APPLY_PATH = "/jobs/abc-tech-junior-web-developer/apply";

const createdEmails = [];
function newEmail(name) {
  const email = testEmail(name);
  createdEmails.push(email);
  return email;
}

test.describe.configure({ mode: "serial" });

test.afterAll(async () => {
  await deleteAccounts(createdEmails);
});

async function fillHrSignUp(page, { name, email, password, company }) {
  await page.goto("/signup?role=hr");
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Company name").fill(company);
}

async function fillCandidateSignUp(page, { name, email, password }, path = "/signup?role=candidate") {
  await page.goto(path);
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
}

async function logIn(page, email, password = TEST_PASSWORD, path = "/login") {
  await page.goto(path);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

function requirement(page, text) {
  return page.getByRole("list", { name: "Password requirements" }).getByRole("listitem").filter({ hasText: text });
}

test.describe("Landing page", () => {
  test("buttons lead to Sign Up with the right role chosen", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "I'm hiring" }).first().click();
    await expect(page).toHaveURL(/\/signup\?role=hr/);
    await expect(page.getByRole("radio", { name: "I'm hiring" })).toBeChecked();

    await page.goto("/");
    await page.getByRole("link", { name: "I'm looking for a job" }).first().click();
    await expect(page).toHaveURL(/\/signup\?role=candidate/);
    await expect(page.getByRole("radio", { name: "I'm looking for a job" })).toBeChecked();
  });
});

test.describe("HR sign up", () => {
  test("Sara signs up with ABC Tech and lands on the empty HR Dashboard", async ({ page }) => {
    const email = newEmail("sara");
    await fillHrSignUp(page, { name: "Sara", email, password: TEST_PASSWORD, company: "ABC Tech" });
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/hr\/dashboard/);
    await expect(page.getByText("You have no jobs yet")).toBeVisible();

    const [profile] = await findAccount(email);
    expect(profile.role).toBe("hr");
    expect(profile.full_name).toBe("Sara");
    expect(profile.company_id).toBeTruthy();
    expect(profile.companies.name).toBe("ABC Tech");
    expect(profile.companies.slug).toMatch(/^abc-tech(-\d+)?$/);
  });

  test("password requirements tick as she types, and a weak password is rejected", async ({ page }) => {
    const email = newEmail("sara-weak");
    await fillHrSignUp(page, { name: "Sara", email, password: "abc", company: "ABC Tech" });
    for (const text of ["At least 8 characters", "One capital letter", "One special character"]) {
      await expect(requirement(page, text)).toHaveAttribute("data-met", "false");
    }

    const password = page.getByLabel("Password", { exact: true });
    await password.fill("Abctech2026");
    await expect(requirement(page, "At least 8 characters")).toHaveAttribute("data-met", "true");
    await expect(requirement(page, "One capital letter")).toHaveAttribute("data-met", "true");
    await expect(requirement(page, "One special character")).toHaveAttribute("data-met", "false");

    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText(PASSWORD_ERROR)).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
    expect(await findAccount(email)).toHaveLength(0);

    await password.fill(TEST_PASSWORD);
    await expect(requirement(page, "One special character")).toHaveAttribute("data-met", "true");
  });

  test("an existing email shows Email already in use with a link to log in", async ({ page }) => {
    const email = newEmail("sara-taken");
    await createAccount({ role: "hr", fullName: "Sara", email, companyName: "ABC Tech" });

    await fillHrSignUp(page, { name: "Sara", email, password: TEST_PASSWORD, company: "ABC Tech" });
    await page.getByRole("button", { name: "Create account" }).click();

    const alert = page.getByRole("alert").filter({ hasText: "Email already in use" });
    await expect(alert).toBeVisible();
    await expect(alert.getByRole("link", { name: "Log in" })).toBeVisible();
    expect(await findAccount(email)).toHaveLength(1);
  });

  test("an empty company name shows This field is required and creates no account", async ({ page }) => {
    const email = newEmail("sara-nocompany");
    await fillHrSignUp(page, { name: "Sara", email, password: TEST_PASSWORD, company: "" });
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("This field is required")).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
    expect(await findAccount(email)).toHaveLength(0);
  });
});

test.describe("Candidate sign up", () => {
  test("Ali signs up and is logged in on My Applications", async ({ page }) => {
    const email = newEmail("ali");
    await fillCandidateSignUp(page, { name: "Ali", email, password: TEST_PASSWORD });
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/my-applications/);
    await expect(page.getByText("You haven't applied to any jobs yet")).toBeVisible();
    const [profile] = await findAccount(email);
    expect(profile.role).toBe("candidate");
    expect(profile.company_id).toBeNull();
  });

  test("signing up after clicking Apply returns Ali to the same job's apply form", async ({ page }) => {
    const email = newEmail("ali-apply");
    const next = encodeURIComponent(APPLY_PATH);
    await fillCandidateSignUp(
      page,
      { name: "Ali", email, password: TEST_PASSWORD },
      `/signup?role=candidate&next=${next}`
    );
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(new RegExp(`${APPLY_PATH}$`));
  });

  test("the password abctech2026 is rejected with only the 8-character requirement ticked", async ({ page }) => {
    const email = newEmail("ali-weak");
    await fillCandidateSignUp(page, { name: "Ali", email, password: "abctech2026" });

    await expect(requirement(page, "At least 8 characters")).toHaveAttribute("data-met", "true");
    await expect(requirement(page, "One capital letter")).toHaveAttribute("data-met", "false");
    await expect(requirement(page, "One special character")).toHaveAttribute("data-met", "false");

    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText(PASSWORD_ERROR)).toBeVisible();
    expect(await findAccount(email)).toHaveLength(0);
  });

  test("an existing email shows Email already in use. Log in instead? and no second account", async ({ page }) => {
    const email = newEmail("ali-taken");
    await createAccount({ role: "candidate", fullName: "Ali", email });

    await fillCandidateSignUp(page, { name: "Ali", email, password: TEST_PASSWORD });
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByRole("alert").filter({ hasText: "Email already in use. Log in instead?" })).toBeVisible();
    expect(await findAccount(email)).toHaveLength(1);
  });
});

test.describe("Log in and log out", () => {
  let saraEmail;
  let aliEmail;

  test.beforeAll(async () => {
    saraEmail = newEmail("sara-login");
    aliEmail = newEmail("ali-login");
    await createAccount({ role: "hr", fullName: "Sara", email: saraEmail, companyName: "ABC Tech" });
    await createAccount({ role: "candidate", fullName: "Ali", email: aliEmail });
  });

  test("Sara lands on the HR Dashboard and Ali lands on My Applications", async ({ page }) => {
    await logIn(page, saraEmail);
    await expect(page).toHaveURL(/\/hr\/dashboard/);

    await page.context().clearCookies();
    await logIn(page, aliEmail);
    await expect(page).toHaveURL(/\/my-applications/);
  });

  test("a wrong password shows Email or password is incorrect with a Forgot password link", async ({ page }) => {
    await logIn(page, saraEmail, "Wrong-password1!");
    const alert = page.getByRole("alert").filter({ hasText: "Email or password is incorrect" });
    await expect(alert).toBeVisible();
    await expect(alert.getByRole("link", { name: "Forgot password" })).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel("Email", { exact: true })).toHaveValue(saraEmail);
  });

  test("Sign out from the menu ends the session and returns to the login page", async ({ page }) => {
    await logIn(page, saraEmail);
    await expect(page).toHaveURL(/\/hr\/dashboard/);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/hr/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("on a phone, Ali signs out from the menu and must log in again", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await logIn(page, aliEmail);
    await expect(page).toHaveURL(/\/my-applications/);

    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/my-applications");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Please log in to continue")).toBeVisible();
  });

  test("no horizontal scroll at 360px on the auth pages", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of ["/", "/signup?role=hr", "/login", "/forgot-password"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("Page protection", () => {
  test("a logged-out user who opens an HR page is sent to Login and sees no data", async ({ page }) => {
    await page.goto("/hr/dashboard");
    await expect(page).toHaveURL(/\/login\?.*next=%2Fhr%2Fdashboard/);
    await expect(page.getByText("Please log in to continue")).toBeVisible();
    await expect(page.getByText("You have no jobs yet")).toHaveCount(0);
  });

  test("after logging in, the user returns to the page they opened", async ({ page }) => {
    const email = newEmail("sara-return");
    await createAccount({ role: "hr", fullName: "Sara", email, companyName: "ABC Tech" });
    await page.goto("/hr/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/hr\/dashboard/);
  });

  test("Privacy: Ali (candidate) opening an HR page sees You don't have access and no HR data", async ({ page }) => {
    const email = newEmail("ali-blocked");
    await createAccount({ role: "candidate", fullName: "Ali", email });
    await logIn(page, email);
    await expect(page).toHaveURL(/\/my-applications/);

    await page.goto("/hr/dashboard");
    await expect(page.getByText("You don't have access to this page")).toBeVisible();
    await expect(page.getByRole("link", { name: "My Applications" }).first()).toBeVisible();
    await expect(page.getByText("You have no jobs yet")).toHaveCount(0);
  });
});

test.describe("Forgot and reset password", () => {
  test("requesting a reset shows the neutral message", async ({ page }) => {
    const email = newEmail("sara-forgot");
    await createAccount({ role: "hr", fullName: "Sara", email, companyName: "ABC Tech" });
    await page.goto("/login");
    await page.getByRole("link", { name: "Forgot password" }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText(NEUTRAL_RESET)).toBeVisible();
  });

  test("Privacy: an email with no account gets the same message", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email", { exact: true }).fill("test@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText(NEUTRAL_RESET)).toBeVisible();
  });

  test("an invalid email shows Please enter a valid email", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email", { exact: true }).fill("not-an-email");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText("Please enter a valid email")).toBeVisible();
  });

  test("an expired link shows This link has expired, request a new one", async ({ page }) => {
    await page.goto("/auth/callback?token_hash=expired-or-used&type=recovery&next=/reset-password");
    await expect(page.getByText("This link has expired, request a new one")).toBeVisible();
    await expect(page.getByRole("link", { name: /request a new one|Forgot password/i }).first()).toBeVisible();
  });

  for (const person of [
    { role: "hr", name: "Sara", home: /\/hr\/dashboard/ },
    { role: "candidate", name: "Ali", home: /\/my-applications/ },
  ]) {
    test(`a valid link lets ${person.name} save a new password and lands on the right page`, async ({ page, baseURL }) => {
      const email = newEmail(`${person.name.toLowerCase()}-reset`);
      await createAccount({ role: person.role, fullName: person.name, email, companyName: "ABC Tech" });

      await page.goto(await recoveryLink(baseURL, email));
      await expect(page).toHaveURL(/\/reset-password/);

      const newPassword = "Newpass2026#";
      await page.getByLabel("New password").fill("123");
      await page.getByLabel("Confirm password").fill("123");
      await page.getByRole("button", { name: "Save password" }).click();
      await expect(page.getByText(PASSWORD_ERROR)).toBeVisible();

      await page.getByLabel("New password").fill(newPassword);
      await page.getByLabel("Confirm password").fill("Different2026#");
      await page.getByRole("button", { name: "Save password" }).click();
      await expect(page.getByText("Passwords don't match")).toBeVisible();

      await page.getByLabel("Confirm password").fill(newPassword);
      await page.getByRole("button", { name: "Save password" }).click();
      await expect(page.getByText("Password updated")).toBeVisible();
      await expect(page).toHaveURL(person.home);

      // The new password works for the next log in.
      await page.context().clearCookies();
      await logIn(page, email, newPassword);
      await expect(page).toHaveURL(person.home);
    });
  }
});
