import { Suspense } from "react";
import { CalendarClock } from "lucide-react";
import InterviewsList from "@/components/interviews/InterviewsList";
import PageHeader from "@/components/nav/PageHeader";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import RetryButton from "@/components/ui/RetryButton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { listInterviews } from "@/lib/interviews/queries";

export const metadata = { title: "Interviews · HireLens" };

// Interviews page (Feature 16): upcoming (soonest first) and past interviews for the HR user's company.
export default function InterviewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Interviews" subtitle="Move a candidate to Interview on the Pipeline to schedule one." />
      <Suspense fallback={<InterviewsSkeleton />}>
        <Interviews />
      </Suspense>
    </div>
  );
}

function InterviewsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading interviews">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-24 animate-pulse rounded-card bg-surface-sunken" />
      ))}
    </div>
  );
}

async function Interviews() {
  let interviews;
  try {
    const profile = await getCurrentProfile();
    interviews = await listInterviews(profile.company_id);
  } catch {
    return <Alert tone="error" title="Couldn't load interviews" action={<RetryButton />} />;
  }

  if (interviews.upcoming.length === 0 && interviews.past.length === 0) {
    return (
      <section className="rounded-card border border-border bg-surface shadow-card">
        <EmptyState icon={CalendarClock} title="No interviews scheduled yet" action={<Button href="/hr/pipeline">Open the Pipeline</Button>}>
          Move a candidate to Interview to schedule one.
        </EmptyState>
      </section>
    );
  }

  return <InterviewsList upcoming={interviews.upcoming} past={interviews.past} />;
}
