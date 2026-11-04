import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { LOGO_ERROR, MAX_LOGO_BYTES, logoKind } from "@/lib/companies/validation";

// POST /api/company/logo: HR uploads the company logo (Feature 06). PNG or JPG under 2 MB, saved in the
// public logos bucket at {company_id}/logo.png or logo.jpg with HR's session (storage rules allow only
// their own company's folder). A new logo replaces the old one.
export async function POST(request) {
  const fail = (message, status = 400) => Response.json({ error: message }, { status });
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "hr") return fail("Only HR can change the logo", 401);
    if (Number(request.headers.get("content-length") || 0) > MAX_LOGO_BYTES + 64 * 1024) return fail(LOGO_ERROR, 413);

    const file = (await request.formData()).get("logo");
    if (!(file instanceof File) || file.size > MAX_LOGO_BYTES) return fail(LOGO_ERROR);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = logoKind(bytes);
    if (!kind) return fail(LOGO_ERROR);

    const supabase = await createClient();
    const folder = profile.company_id;
    const path = `${folder}/logo.${kind}`;
    await runSupabase(() =>
      supabase.storage.from("logos").upload(path, bytes, {
        contentType: kind === "png" ? "image/png" : "image/jpeg",
        upsert: true,
      })
    );
    // Only one logo: remove the file with the other extension if there was one.
    const other = `${folder}/logo.${kind === "png" ? "jpg" : "png"}`;
    await supabase.storage.from("logos").remove([other]);

    // ?v= makes browsers show the new logo instead of a cached old one.
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    const logoUrl = `${data.publicUrl}?v=${Date.now()}`;
    await runSupabase(() => supabase.from("companies").update({ logo_url: logoUrl }).eq("id", folder));
    return Response.json({ logoUrl, message: "Logo updated" });
  } catch {
    return fail("Couldn't save, try again", 500);
  }
}
