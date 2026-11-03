import { Briefcase } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Dashboard · HireLens" };

// HR Dashboard. Jobs and applicant counts arrive with Feature 02 (Post a job).
export default function HrDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="page-title">Dashboard</h1>
      <section className="rounded-card border border-border bg-surface shadow-card">
        <EmptyState icon={Briefcase} title="You have no jobs yet">
          Post your first job and share the link with candidates.
        </EmptyState>
      </section>
    </div>
  );
}
