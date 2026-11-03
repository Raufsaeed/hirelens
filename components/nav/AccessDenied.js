import { Lock } from "lucide-react";
import Brand from "@/components/ui/Brand";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

// Shown instead of a page that belongs to the other role. No data of that page is loaded.
export default function AccessDenied({ homeHref, homeLabel }) {
  return (
    <div className="flex min-h-dvh flex-col items-center gap-8 bg-surface-page px-4 py-10">
      <Brand />
      <div className="w-full max-w-form rounded-card border border-border bg-surface shadow-card">
        <EmptyState
          icon={Lock}
          title="You don't have access to this page"
          action={<Button href={homeHref}>{homeLabel}</Button>}
        >
          This page belongs to another type of account.
        </EmptyState>
      </div>
    </div>
  );
}
