import { CircleDot, Clock, Lock, Pencil } from "lucide-react";
import Badge from "@/components/ui/Badge";

// Job status: Draft (grey), Open (purple), Closed (light grey, dashed).
export default function JobStatusBadge({ status, closedReason }) {
  if (status === "open") return <Badge tone="primary" icon={CircleDot}>Open</Badge>;
  if (status === "closed") {
    return closedReason === "deadline" ? (
      <Badge tone="muted" icon={Clock}>Closed · Deadline passed</Badge>
    ) : (
      <Badge tone="muted" icon={Lock}>Closed</Badge>
    );
  }
  return <Badge tone="neutral" icon={Pencil}>Draft</Badge>;
}
