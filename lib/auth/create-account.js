import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";
import { slugify, slugWithNumber } from "@/lib/companies/slug";

// Profiles and companies can only be inserted by the server (Row Level Security has no insert rule),
// so sign up uses the admin client here, after Supabase Auth has created the user.

const UNIQUE_VIOLATION = "23505";
const MAX_SLUG_ATTEMPTS = 20;

// Creates the company with a free slug: "abc-tech", or "abc-tech-2" if that is taken.
async function createCompany(admin, name) {
  const base = slugify(name);
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    try {
      return await runSupabase(() =>
        admin
          .from("companies")
          .insert({ name, slug: slugWithNumber(base, attempt) })
          .select("id")
          .single()
      );
    } catch (error) {
      if (error.code !== UNIQUE_VIOLATION) throw error;
    }
  }
  throw new Error("No free company slug found");
}

// Saves the profile (and the company for HR). Undoes the company if the profile fails.
export async function createAccountRecords({ userId, fullName, email, role, companyName }) {
  const admin = createAdminClient();
  const company = role === "hr" ? await createCompany(admin, companyName) : null;

  try {
    await runSupabase(() =>
      admin.from("profiles").insert({
        id: userId,
        full_name: fullName,
        email,
        role,
        company_id: company?.id ?? null,
      })
    );
  } catch (error) {
    if (company) await admin.from("companies").delete().eq("id", company.id);
    throw error;
  }
}

// Removes a half-created Auth user, so the email can be used again.
export async function deleteAuthUser(userId) {
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(userId);
}
