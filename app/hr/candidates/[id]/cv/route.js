import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runSupabase } from "@/lib/supabase/run";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { isUuid } from "@/lib/uuid";

// GET /hr/candidates/<id>/cv: "Open original CV". Only HR of the job's company (Row Level Security
// decides whether the application can be read). The CV stays private: HR gets a link valid for 60 seconds.
export async function GET(request, { params }) {
  const { id } = await params;
  const notFound = () => new Response("This CV could not be found", { status: 404 });
  try {
    const profile = await getCurrentProfile();
    if (profile?.role !== "hr" || !isUuid(id)) return notFound();

    const supabase = await createClient();
    const application = await runSupabase(() =>
      supabase.from("applications").select("cv_file_path").eq("id", id).maybeSingle()
    );
    if (!application) return notFound();

    const signed = await runSupabase(() =>
      createAdminClient().storage.from("cvs").createSignedUrl(application.cv_file_path, 60)
    );
    return Response.redirect(signed.signedUrl, 302);
  } catch {
    return new Response("Something went wrong, please try again", { status: 500 });
  }
}
