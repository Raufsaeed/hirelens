import { FileText } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "My Applications · HireLens" };

// My Applications. The list of applications arrives with Feature 09.
export default function MyApplicationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="page-title">My Applications</h1>
      <section className="rounded-card border border-border bg-surface shadow-card">
        <EmptyState icon={FileText} title="You haven't applied to any jobs yet">
          Find a job you like and apply with your CV in a minute.
        </EmptyState>
      </section>
    </div>
  );
}
