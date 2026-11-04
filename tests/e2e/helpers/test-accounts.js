import { createClient } from "@supabase/supabase-js";

// Test-only helpers: create and delete dummy accounts with the server key.
// Keys come from .env.local (loaded in playwright.config.js), never from this file.

export const TEST_PASSWORD = "Abctech2026@";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// A unique dummy email for each test run, so runs never clash.
export function testEmail(name) {
  const tag = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return `${name}.e2e${tag}@example.com`;
}

// Creates an account directly (for tests that need an existing account).
export async function createAccount({ role, fullName, email, companyName }) {
  const admin = adminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;

  let companyId = null;
  if (role === "hr") {
    const slug = `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${data.user.id.slice(0, 8)}`;
    const company = await admin
      .from("companies")
      .insert({ name: companyName, slug })
      .select("id")
      .single();
    if (company.error) throw company.error;
    companyId = company.data.id;
  }

  const profile = await admin.from("profiles").insert({
    id: data.user.id,
    full_name: fullName,
    email,
    role,
    company_id: companyId,
  });
  if (profile.error) throw profile.error;
  return { id: data.user.id, email, companyId };
}

// Reads the profile and company for an email (to check what sign up created).
export async function findAccount(email) {
  const admin = adminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, email, role, company_id, companies(name, slug)")
    .eq("email", email);
  if (error) throw error;
  return data;
}

let jobCounter = 0;

// Creates a job directly (for tests that need an existing job). Open by default, with a unique slug.
export async function createJob(companyId, fields = {}) {
  const admin = adminClient();
  jobCounter += 1;
  const title = fields.title || "Junior Web Developer";
  const row = {
    company_id: companyId,
    title,
    slug: `e2e-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${jobCounter}`,
    location: "Lahore",
    job_type: "full-time",
    required_years: 1,
    required_degree: "BS Computer Science",
    requirements: [
      { name: "HTML", type: "must" },
      { name: "React", type: "must" },
      { name: "REST APIs", type: "nice" },
    ],
    description: "Build and maintain web pages for ABC Tech clients using React.",
    status: "open",
    ...fields,
  };
  const { data, error } = await admin.from("jobs").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function getJob(jobId) {
  const admin = adminClient();
  const { data, error } = await admin.from("jobs").select("*").eq("id", jobId).single();
  if (error) throw error;
  return data;
}

// Reads a company's jobs with the server key (to check what the app saved).
export async function findJobs(companyId) {
  const admin = adminClient();
  const { data, error } = await admin.from("jobs").select("*").eq("company_id", companyId);
  if (error) throw error;
  return data;
}

// Reads a job as a logged-out visitor would (publishable key, Row Level Security applies).
export async function readJobAsVisitor(jobId) {
  const visitor = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data, error } = await visitor.from("jobs").select("id, status").eq("id", jobId);
  if (error) throw error;
  return data;
}

// Today's date in Pakistan as YYYY-MM-DD, moved by `days` (deadlines use Asia/Karachi).
export function pakistanDate(days = 0) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date());
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// A one-time password reset link for an account, like the one in the reset email.
export async function recoveryLink(baseURL, email) {
  const admin = adminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  if (error) throw error;
  const tokenHash = data.properties.hashed_token;
  return `${baseURL}/auth/callback?token_hash=${tokenHash}&type=recovery&next=/reset-password`;
}

// Deletes every account (and its company) created with these emails.
export async function deleteAccounts(emails) {
  const admin = adminClient();
  for (const email of emails) {
    const { data } = await admin
      .from("profiles")
      .select("id, company_id")
      .eq("email", email);
    const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const user = users?.users.find((u) => u.email === email);
    if (user) await admin.auth.admin.deleteUser(user.id);
    for (const row of data || []) {
      if (!row.company_id) continue;
      // Jobs block deleting their company, so remove them first (ignored if the table doesn't exist yet).
      await admin.from("jobs").delete().eq("company_id", row.company_id);
      await admin.from("companies").delete().eq("id", row.company_id);
    }
  }
}
