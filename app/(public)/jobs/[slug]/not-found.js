import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

// Drafts and unknown job links: no job details, no Apply button.
export default function JobNotFound() {
  return (
    <section className="rounded-card border border-border bg-surface shadow-card">
      <EmptyState icon={Search} title="This job could not be found" action={<Button href="/jobs">Browse jobs</Button>}>
        The link may be old, or the job isn&apos;t public.
      </EmptyState>
    </section>
  );
}
