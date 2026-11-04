import { CalendarClock, CircleSlash, Handshake, PartyPopper, Send, Star, Undo2 } from "lucide-react";
import Badge from "@/components/ui/Badge";

// Pipeline status with its icon and word (design/components/StatusBadge).
// Candidates read "Rejected" as the kinder "Not selected".
export const APPLICATION_STATUSES = {
  applied: { label: "Applied", tone: "neutral", icon: Send },
  shortlisted: { label: "Shortlisted", tone: "primary", icon: Star },
  interview: { label: "Interview", tone: "info", icon: CalendarClock },
  offer: { label: "Offer", tone: "amber", icon: Handshake },
  hired: { label: "Hired", tone: "success", icon: PartyPopper },
  rejected: { label: "Rejected", candidateLabel: "Not selected", tone: "danger", icon: CircleSlash },
  withdrawn: { label: "Withdrawn", tone: "muted", icon: Undo2 },
};

export default function ApplicationStatusBadge({ status, forCandidate = false }) {
  const info = APPLICATION_STATUSES[status] || APPLICATION_STATUSES.applied;
  return (
    <Badge tone={info.tone} icon={info.icon}>
      {forCandidate ? info.candidateLabel || info.label : info.label}
    </Badge>
  );
}
