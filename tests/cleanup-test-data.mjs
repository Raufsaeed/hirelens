// Deletes leftover Playwright test data: every user with an @example.com email, plus their companies,
// jobs, applications (with screenings, history, notes and interviews by cascade), saved jobs, CV files
// and company logos. Real accounts are never touched: only @example.com emails count as test users.
//
//   npm run test:cleanup              delete the leftovers
//   npm run test:cleanup -- --dry-run list them only
//
// Keys come from .env.local (loaded by Node at run time) and are never printed.
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  console.error("Couldn't load .env.local. Run this from the project folder.");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const TEST_DOMAIN = "@example.com";

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const isTestEmail = (email) => String(email || "").toLowerCase().endsWith(TEST_DOMAIN);

// Throws on a Supabase error, so the script never deletes based on a half-failed read.
function check({ data, error }, what) {
  if (error) throw new Error(`${what}: ${error.message}`);
  return data;
}

async function allAuthUsers() {
  const users = [];
  for (let page = 1; ; page++) {
    const { users: batch } = check(await admin.auth.admin.listUsers({ page, perPage: 1000 }), "List users");
    users.push(...batch);
    if (batch.length < 1000) return users;
  }
}

// Every file path under a storage folder (folders are listed one level at a time).
async function filesUnder(bucket, prefix) {
  const paths = [];
  const entries = check(await admin.storage.from(bucket).list(prefix, { limit: 1000 }), `List ${bucket}/${prefix}`);
  for (const entry of entries || []) {
    const path = `${prefix}/${entry.name}`;
    if (entry.id) paths.push(path); // a file
    else paths.push(...(await filesUnder(bucket, path))); // a folder
  }
  return paths;
}

// Every row of a table (Supabase returns at most 1,000 rows per request, so read page by page).
async function allRows(table, columns) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const batch = check(await admin.from(table).select(columns).order("id").range(from, from + 999), `List ${table}`);
    rows.push(...batch);
    if (batch.length < 1000) return rows;
  }
}

async function inBatches(ids, size, run) {
  for (let i = 0; i < ids.length; i += size) await run(ids.slice(i, i + size));
}

// ---------- Find the test data ----------

const authUsers = (await allAuthUsers()).filter((user) => isTestEmail(user.email));
const profiles = await allRows("profiles", "id, email, role, company_id");
const testProfiles = profiles.filter((profile) => isTestEmail(profile.email));
const userIds = [...new Set([...authUsers.map((u) => u.id), ...testProfiles.map((p) => p.id)])];
const emailOf = new Map([...testProfiles.map((p) => [p.id, p.email]), ...authUsers.map((u) => [u.id, u.email])]);

// Companies of test HR users, plus companies with no HR left (a run stopped mid-cleanup) whose slug ends
// in the 8-character code the test helpers add, like "abc-tech-b94a2127". Other companies are never touched.
const companies = await allRows("companies", "id, name, slug");
const companiesWithHr = new Set(profiles.filter((p) => p.company_id).map((p) => p.company_id));
const testCompanyIds = new Set(testProfiles.filter((p) => p.company_id).map((p) => p.company_id));
const realCompanyIds = new Set(profiles.filter((p) => p.company_id && !isTestEmail(p.email)).map((p) => p.company_id));
const TEST_SLUG = /-[0-9a-f]{8}$/;
const orphanCompanies = companies.filter((c) => !companiesWithHr.has(c.id) && TEST_SLUG.test(c.slug));
for (const company of orphanCompanies) testCompanyIds.add(company.id);
for (const id of realCompanyIds) testCompanyIds.delete(id); // never a company a real user belongs to
const testCompanies = companies.filter((c) => testCompanyIds.has(c.id));
const companyIds = testCompanies.map((c) => c.id);

const jobs = (await allRows("jobs", "id, company_id")).filter((job) => testCompanyIds.has(job.company_id));
const jobIds = jobs.map((job) => job.id);

const applications = await allRows("applications", "id, job_id, candidate_id");
const testUserIds = new Set(userIds);
const testJobIds = new Set(jobIds);
const testApplications = applications.filter((a) => testJobIds.has(a.job_id) || testUserIds.has(a.candidate_id));
// A real candidate's application to a test job would be lost with the job: stop instead.
const realOnTestJobs = testApplications.filter((a) => testJobIds.has(a.job_id) && !testUserIds.has(a.candidate_id));
if (realOnTestJobs.length) {
  console.error(`Stopped: ${realOnTestJobs.length} application(s) from real accounts are on test jobs. Nothing was deleted.`);
  process.exit(1);
}

const savedJobs = (await allRows("saved_jobs", "id, job_id, candidate_id")).filter(
  (row) => testJobIds.has(row.job_id) || testUserIds.has(row.candidate_id)
);

const cvFiles = [];
for (const id of userIds) cvFiles.push(...(await filesUnder("cvs", id)));
const logoFiles = [];
for (const id of companyIds) logoFiles.push(...(await filesUnder("logos", id)));

// ---------- Show it ----------

const candidates = userIds.filter((id) => !testProfiles.find((p) => p.id === id && p.role === "hr"));
console.log(`Test users (@example.com): ${userIds.length}`);
console.log(`  HR: ${userIds.length - candidates.length}, candidates or without profile: ${candidates.length}`);
for (const id of userIds) console.log(`  - ${emailOf.get(id)}`);
console.log(`Companies: ${testCompanies.length} (of which ${orphanCompanies.length} with no HR left)`);
for (const company of testCompanies) console.log(`  - ${company.name} (${company.slug})`);
console.log(`Jobs: ${jobs.length}`);
console.log(`Applications: ${testApplications.length} (their screenings, history, notes and interviews go with them)`);
console.log(`Saved jobs: ${savedJobs.length}`);
console.log(`CV files: ${cvFiles.length}`);
console.log(`Logo files: ${logoFiles.length}`);

if (DRY_RUN) {
  console.log("\nDry run: nothing was deleted.");
  process.exit(0);
}

// ---------- Delete it (children first) ----------

const savedIds = savedJobs.map((row) => row.id);
await inBatches(savedIds, 100, async (ids) => check(await admin.from("saved_jobs").delete().in("id", ids), "Delete saved jobs"));
const applicationIds = testApplications.map((a) => a.id);
await inBatches(applicationIds, 100, async (ids) => check(await admin.from("applications").delete().in("id", ids), "Delete applications"));
await inBatches(jobIds, 100, async (ids) => check(await admin.from("jobs").delete().in("id", ids), "Delete jobs"));
await inBatches(cvFiles, 100, async (paths) => check(await admin.storage.from("cvs").remove(paths), "Delete CV files"));
await inBatches(logoFiles, 100, async (paths) => check(await admin.storage.from("logos").remove(paths), "Delete logos"));

// Deleting the Auth user removes the profile and everything else linked to it (cascade).
const authIds = new Set(authUsers.map((u) => u.id));
for (const id of userIds) {
  if (authIds.has(id)) check(await admin.auth.admin.deleteUser(id), `Delete user ${emailOf.get(id)}`);
  else check(await admin.from("profiles").delete().eq("id", id), `Delete profile ${emailOf.get(id)}`);
}
await inBatches(companyIds, 100, async (ids) => check(await admin.from("companies").delete().in("id", ids), "Delete companies"));

console.log("\nDone: the test data above was deleted.");
