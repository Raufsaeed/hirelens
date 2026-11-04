import { Clock, Lock } from "lucide-react";

// "Apply by 20 Oct" (plain), "Apply by 20 Oct · 3 days left" / "Last day to apply" (orange pill),
// or "Applications closed on 20 Oct" (grey pill). `deadline` comes from deadlineInfo() in lib/jobs/dates.js.
const STYLES = {
  plain: { classes: "text-ink-muted font-medium", icon: Clock, iconClass: "" },
  soon: { classes: "rounded-pill bg-warning-bg px-2.5 py-0.5 font-bold text-warning-text", icon: Clock, iconClass: "text-warning" },
  closed: {
    classes: "rounded-pill border border-dashed border-border-control bg-muted-bg px-2.5 py-0.5 font-medium text-muted-text",
    icon: Lock,
    iconClass: "",
  },
};

export default function DeadlineLabel({ deadline }) {
  if (!deadline) return null;
  const { classes, icon: Icon, iconClass } = STYLES[deadline.kind];
  return (
    <span className={`small inline-flex w-fit max-w-full items-center gap-1.5 ${classes}`}>
      <Icon className={`size-icon-sm shrink-0 ${iconClass}`} strokeWidth={1.75} aria-hidden="true" />
      {deadline.text}
    </span>
  );
}
