import { CircleCheck } from "lucide-react";
import Brand from "@/components/ui/Brand";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Account deleted · HireLens" };

// After a candidate deletes their account (Feature 22). They are already logged out.
export default function AccountDeletedPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center gap-8 bg-surface-page px-4 py-10">
      <Brand />
      <div className="w-full max-w-form rounded-card border border-border bg-surface shadow-card">
        <EmptyState icon={CircleCheck} title="Your account has been deleted" action={<Button href="/jobs">Browse jobs</Button>}>
          Your applications, CVs and everything linked to them are gone.
        </EmptyState>
      </div>
    </div>
  );
}
