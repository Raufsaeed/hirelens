// A status pill: always an icon and a word, so colour never carries the meaning alone.
const TONES = {
  neutral: "bg-neutral-bg text-neutral-text",
  primary: "bg-primary-tint text-on-primary-tint",
  info: "bg-info-bg text-info-text",
  amber: "bg-amber-bg text-amber-text",
  success: "bg-success-bg text-success-text",
  danger: "bg-danger-bg text-danger-text",
  warning: "bg-warning-bg text-warning-text",
  muted: "border-dashed border-border-control bg-muted-bg text-muted-text",
};

export default function Badge({ tone = "neutral", icon: Icon, children }) {
  return (
    <span
      className={`label inline-flex min-h-6.5 w-fit max-w-full items-center gap-1.5 rounded-pill border border-transparent px-2.5 py-0.5 whitespace-nowrap transition-colors duration-(--duration-base) ease-out ${TONES[tone]}`}
    >
      {Icon && <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />}
      {children}
    </span>
  );
}
