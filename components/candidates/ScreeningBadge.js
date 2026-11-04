import { CircleAlert, CircleCheck, FileX, Hourglass } from "lucide-react";
import Badge from "@/components/ui/Badge";

// Screening status (HR only): Queued, Screening…, Done, Pending, or "CV could not be read".
export default function ScreeningBadge({ status }) {
  if (status === "done") return <Badge tone="success" icon={CircleCheck}>Done</Badge>;
  if (status === "failed") return <Badge tone="warning" icon={FileX}>CV could not be read</Badge>;
  if (status === "processing") {
    return (
      <span className="label inline-flex min-h-6.5 w-fit items-center gap-1.5 rounded-pill bg-primary-tint px-2.5 py-0.5 text-on-primary-tint">
        <span aria-hidden="true" className="size-3 animate-spin rounded-pill border-[1.5px] border-current border-r-transparent" />
        Screening…
      </span>
    );
  }
  if (status === "pending") return <Badge tone="neutral" icon={Hourglass}>Pending</Badge>;
  if (status === "queued") return <Badge tone="neutral" icon={Hourglass}>Queued</Badge>;
  return <Badge tone="danger" icon={CircleAlert}>Unknown</Badge>;
}
