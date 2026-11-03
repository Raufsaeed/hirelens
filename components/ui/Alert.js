import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

// Inline message that belongs to a page or form (design/components/Alert).
const TONES = {
  info: { classes: "bg-info-bg text-info-text", icon: Info, iconClass: "text-info" },
  success: { classes: "bg-success-bg text-success-text", icon: CircleCheck, iconClass: "text-success" },
  warning: { classes: "bg-warning-bg text-warning-text", icon: TriangleAlert, iconClass: "text-warning" },
  error: { classes: "bg-danger-bg text-danger-text", icon: CircleAlert, iconClass: "text-danger" },
};

export default function Alert({ tone = "info", title, children, action }) {
  const { classes, icon: Icon, iconClass } = TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex animate-fade-up items-start gap-3 rounded-control px-4 py-3.5 text-sm leading-[22px] ${classes}`}
    >
      <Icon className={`mt-px size-icon-md shrink-0 ${iconClass}`} strokeWidth={1.75} aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-0.5">
        {title && <p className="font-bold">{title}</p>}
        {children && <div>{children}</div>}
      </div>
      {action && <div className="ml-auto self-center">{action}</div>}
    </div>
  );
}
