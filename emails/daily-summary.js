import { renderEmail } from "@/emails/layout";

// The HR daily summary (Feature 23): new applicants per job since the last summary. Counts only,
// never names, scores, AI results or notes. jobs: [{ title, count }].
export function dailySummaryEmail({ hrName, companyName, jobs, origin }) {
  const total = jobs.reduce((sum, job) => sum + job.count, 0);
  return renderEmail({
    subject: `New applicants at ${companyName}: your daily summary`,
    heading: `Hi ${hrName},`,
    lines: [
      `${total} new ${total === 1 ? "applicant" : "applicants"} since your last summary:`,
      ...jobs.map((job) => `${job.title} · ${job.count} new`),
    ],
    button: { label: "Open the Candidates list", url: `${origin}/hr/candidates` },
  });
}
