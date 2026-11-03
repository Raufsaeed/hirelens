import { Search } from "lucide-react";
import Brand from "@/components/ui/Brand";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Page not found · HireLens" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center gap-8 bg-surface-page px-4 py-10">
      <Brand />
      <div className="w-full max-w-form rounded-card border border-border bg-surface shadow-card">
        <EmptyState icon={Search} title="This page could not be found" action={<Button href="/">Go to the home page</Button>}>
          The link may be old, or the page may not be ready yet.
        </EmptyState>
      </div>
    </div>
  );
}
