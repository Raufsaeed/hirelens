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

export async function updateJob(jobId, fields) {
  const admin = adminClient();
  const { error } = await admin.from("jobs").update(fields).eq("id", jobId);
  if (error) throw error;
}

// A candidate's applications with their status history (to check what the app saved).
export async function findApplications(candidateId) {
  const admin = adminClient();
  const { data, error } = await admin
    .from("applications")
    .select("*, status_history(*)")
    .eq("candidate_id", candidateId);
  if (error) throw error;
  return data;
}

// Creates an application directly, with its first history row (for tests that need one).
export async function createApplication({ job, candidate, status = "applied", cvText }) {
  const admin = adminClient();
  const path = `${candidate.id}/applications/${job.id}/ali-cv.pdf`;
  if (cvText) {
    const upload = await admin.storage.from("cvs").upload(path, cvText, { contentType: "application/pdf", upsert: true });
    if (upload.error) throw upload.error;
  }
  const { data, error } = await admin
    .from("applications")
    .insert({
      job_id: job.id,
      candidate_id: candidate.id,
      candidate_name: candidate.fullName || "Ali",
      candidate_email: candidate.email,
      cv_file_path: path,
      phone: "0300 1234567",
      status,
    })
    .select("*")
    .single();
  if (error) throw error;
  await admin.from("status_history").insert({ application_id: data.id, from_status: null, to_status: "applied" });
  if (status !== "applied") {
    await admin.from("status_history").insert({ application_id: data.id, from_status: "applied", to_status: status });
  }
  return data;
}

// An application with its screening row (to check what screening saved).
export async function findApplication(applicationId) {
  const admin = adminClient();
  const { data, error } = await admin
    .from("applications")
    .select("*, screenings(*), notes(*)")
    .eq("id", applicationId)
    .single();
  if (error) throw error;
  // One screening per application: return it as an object.
  data.screening = Array.isArray(data.screenings) ? data.screenings[0] : data.screenings;
  return data;
}

// Waits until screening leaves queued/processing (screening runs in the background).
export async function waitForScreening(applicationId, timeoutMs = 90 * 1000) {
  const start = Date.now();
  for (;;) {
    const application = await findApplication(applicationId);
    if (!["queued", "processing"].includes(application.screening_status)) return application;
    if (Date.now() - start > timeoutMs) throw new Error(`Screening still ${application.screening_status}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

// Saves a finished screening directly (for list and search tests that don't need real AI).
// screening_status ("done", "pending", "failed") goes on the application; the rest on the screening.
export async function setScreening(applicationId, { screening_status, ...fields }) {
  const admin = adminClient();
  const row = { application_id: applicationId, screened_at: new Date().toISOString(), ...fields };
  const { error } = await admin.from("screenings").upsert(row, { onConflict: "application_id" });
  if (error) throw error;
  const status = screening_status || (fields.score === undefined ? "pending" : "done");
  await admin.from("applications").update({ screening_status: status }).eq("id", applicationId);
}

export async function updateApplication(applicationId, fields) {
  const admin = adminClient();
  const { error } = await admin.from("applications").update(fields).eq("id", applicationId);
  if (error) throw error;
}

// Reads screenings as a logged-in user would (publishable key, Row Level Security applies).
export async function readScreeningsAs(email, applicationId) {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await client.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  const { data } = await client.from("screenings").select("id").eq("application_id", applicationId);
  return data || [];
}

// True when a CV file exists in the private cvs bucket.
export async function cvExists(path) {
  const admin = adminClient();
  const { data, error } = await admin.storage.from("cvs").download(path);
  return !error && Boolean(data);
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

// Removes every CV file a test candidate uploaded ({candidate_id}/applications/{job_id}/file.pdf).
async function removeCvFiles(admin, userId) {
  const { data: folders } = await admin.storage.from("cvs").list(`${userId}/applications`);
  for (const folder of folders || []) {
    const prefix = `${userId}/applications/${folder.name}`;
    const { data: files } = await admin.storage.from("cvs").list(prefix);
    const paths = (files || []).map((file) => `${prefix}/${file.name}`);
    if (paths.length) await admin.storage.from("cvs").remove(paths);
  }
}

// Deletes every account (and its company, jobs, applications and CV files) created with these emails.
// Missing tables are ignored, so this works before later features' SQL has run.
export async function deleteAccounts(emails) {
  const admin = adminClient();
  const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
  for (const email of emails) {
    const { data } = await admin.from("profiles").select("id, company_id").eq("email", email);
    const user = users?.users.find((u) => u.email === email);
    if (user) {
      await removeCvFiles(admin, user.id);
      await admin.auth.admin.deleteUser(user.id); // cascades to the profile and their applications
    }
    for (const row of data || []) {
      if (!row.company_id) continue;
      const { data: jobs } = await admin.from("jobs").select("id").eq("company_id", row.company_id);
      const jobIds = (jobs || []).map((job) => job.id);
      if (jobIds.length) await admin.from("applications").delete().in("job_id", jobIds);
      await admin.from("jobs").delete().eq("company_id", row.company_id);
      await admin.from("companies").delete().eq("id", row.company_id);
    }
  }
}

export async function getCompany(companyId) {
  const admin = adminClient();
  const { data, error } = await admin.from("companies").select("*").eq("id", companyId).single();
  if (error) throw error;
  return data;
}

// Starts an email change the way the confirmation email would, without sending an email
// (Supabase's built-in mailer won't send to test addresses). Returns the link from that email.
export async function emailChangeLink(email, newEmail) {
  const admin = adminClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: "email_change_new", email, newEmail });
  if (error) throw error;
  return data.properties.action_link;
}

// Clicks the confirmation link (Supabase confirms the change and redirects).
export async function openEmailLink(link) {
  await fetch(link, { redirect: "manual" });
}

export async function getProfile(userId) {
  const admin = adminClient();
  const { data, error } = await admin.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

// Saves an interview directly (Feature 16), for tests that need one already booked.
// date "YYYY-MM-DD" and time "HH:MM" are Pakistan time.
export async function createInterview(applicationId, { date, time = "11:00", interviewerName = "Sara", ...fields }) {
  const admin = adminClient();
  const { data, error } = await admin
    .from("interviews")
    .insert({
      application_id: applicationId,
      scheduled_at: `${date}T${time}:00+05:00`,
      interviewer_name: interviewerName,
      meeting_link: "https://meet.google.com/abc-defg-hij",
      ...fields,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function findInterviews(applicationId) {
  const admin = adminClient();
  const { data, error } = await admin
    .from("interviews")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

// Interview feedback rows for an interview (Feature 17), read with the server key.
export async function findFeedback(interviewId) {
  const admin = adminClient();
  const { data, error } = await admin.from("interview_feedback").select("*").eq("interview_id", interviewId);
  if (error) throw error;
  return data;
}

// Reads rows of a table as a logged-in user would (publishable key, Row Level Security applies).
export async function readRowsAs(email, table, column, value) {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // Fail loudly if the login or read fails, so a privacy test can't pass by accident.
  const login = await client.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (login.error) throw login.error;
  const { data, error } = await client.from(table).select("*").eq(column, value);
  if (error) throw error;
  return data;
}

// Reads a CV file from the private cvs bucket as text (test PDFs hold their lines as plain text).
export async function readCvText(path) {
  const admin = adminClient();
  const { data, error } = await admin.storage.from("cvs").download(path);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer()).toString("latin1");
}

// Removes a candidate's default CV behind the app's back (Feature 20: "deleted while applying").
export async function clearDefaultCv(userId) {
  const admin = adminClient();
  const profile = await getProfile(userId);
  if (profile?.default_cv_path) await admin.storage.from("cvs").remove([profile.default_cv_path]);
  const { error } = await admin.from("profiles").update({ default_cv_path: null }).eq("id", userId);
  if (error) throw error;
}
