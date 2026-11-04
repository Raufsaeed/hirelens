import { Building2 } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

// Unknown company link: no data, and a way to browse jobs.
export default function CompanyNotFound() {
  return (
    <section className="rounded-card border border-border bg-surface shadow-card">
      <EmptyState icon={Building2} title="This company could not be found" action={<Button href="/jobs">Browse jobs</Button>}>
        The link may be old or mistyped.
      </EmptyState>
    </section>
  );
}
