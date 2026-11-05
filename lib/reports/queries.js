import "server-only";
import { createClient } from "@/lib/supabase/server";
import { runSupabase } from "@/lib/supabase/run";
import { rangeBounds } from "@/lib/reports/range";

// Applications for Reports (Feature 19). Row Level Security limits rows to the HR user's company,
// and the query only asks for this company's job ids too.

const PAGE_SIZE = 1000;
const MAX_PAGES = 20; // a hard limit, so a bug can never loop forever

export async function listReportApplications(jobIds, range) {
  if (!jobIds.length) return [];
  const supabase = await createClient();
  const { start, end } = rangeBounds(range);
  const rows = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const batch = await runSupabase(() =>
      supabase
        .from("applications")
        .select("id, job_id, status, screening_status, applied_at, screenings(score, requirements_result), status_history(to_status, changed_at)")
        .in("job_id", jobIds)
        .gte("applied_at", start)
        .lt("applied_at", end)
        .order("applied_at", { ascending: true })
        .order("id", { ascending: true })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
    );
    rows.push(...(batch || []));
    if (!batch || batch.length < PAGE_SIZE) break;
  }
  return rows;
}
