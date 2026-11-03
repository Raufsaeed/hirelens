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
      if (row.company_id) await admin.from("companies").delete().eq("id", row.company_id);
    }
  }
}
