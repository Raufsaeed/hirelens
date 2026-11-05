import { CalendarClock, CalendarX, CircleCheck } from "lucide-react";
import Badge from "@/components/ui/Badge";

// An interview's status for HR: Scheduled, Done or Cancelled (Features 16 and 17).
const STATUS_BADGES = {
  scheduled: { tone: "info", icon: CalendarClock, label: "Scheduled" },
  done: { tone: "success", icon: CircleCheck, label: "Done" },
  cancelled: { tone: "muted", icon: CalendarX, label: "Cancelled" },
};

export default function InterviewStatusBadge({ status }) {
  const badge = STATUS_BADGES[status] || STATUS_BADGES.scheduled;
  return (
    <Badge tone={badge.tone} icon={badge.icon}>
      {badge.label}
    </Badge>
  );
}
