import Link from "next/link";

// Buttons trigger actions; links that look like buttons navigate (pass `href`).
// Variants and states follow design/components/Button.

const BASE =
  "relative inline-flex items-center justify-center gap-2 rounded-control border font-bold whitespace-nowrap no-underline cursor-pointer " +
  "transition-[transform,box-shadow,background-color,border-color,color] duration-(--duration-fast) ease-out " +
  "hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.98] active:shadow-none " +
  "focus-visible:outline-none focus-visible:shadow-focus motion-reduce:hover:translate-y-0 " +
  "disabled:cursor-not-allowed disabled:border-surface-sunken disabled:bg-surface-sunken disabled:text-ink-disabled " +
  "disabled:translate-y-0 disabled:shadow-none";

const VARIANTS = {
  primary: "border-primary bg-primary text-on-primary hover:border-primary-hover hover:bg-primary-hover",
  secondary: "border-border-control bg-surface text-ink hover:border-ink-muted",
  ghost:
    "border-transparent bg-transparent text-primary hover:translate-y-0 hover:bg-primary-tint hover:text-on-primary-tint hover:shadow-none",
  // On the deep purple navigation bars
  nav:
    "border-transparent bg-transparent text-nav-text hover:translate-y-0 hover:bg-nav-hover hover:shadow-none focus-visible:shadow-focus-nav",
  // On the purple gradient (landing and auth art)
  "on-dark":
    "border-surface bg-surface text-on-primary-tint hover:border-primary-tint hover:bg-primary-tint " +
    "focus-visible:shadow-[0_0_0_2px_var(--primary-deep),0_0_0_4px_var(--surface)]",
  "outline-dark":
    "border-glass-strong bg-transparent text-on-primary hover:border-on-primary hover:bg-glass " +
    "focus-visible:shadow-[0_0_0_2px_var(--primary-deep),0_0_0_4px_var(--surface)]",
};

const SIZES = {
  sm: "min-h-control-sm px-3 text-[13px] leading-5",
  md: "min-h-control px-4.5 text-[15px] leading-5",
  lg: "min-h-13 px-6 text-base leading-5",
  icon: "size-touch p-0",
};

export function buttonClasses({ variant = "primary", size = "md", block = false, className = "" } = {}) {
  return [BASE, VARIANTS[variant], SIZES[size], block ? "w-full" : "", className].join(" ");
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="absolute size-4.5 animate-spin rounded-pill border-2 border-current border-r-transparent"
    />
  );
}

export default function Button({
  children,
  href,
  icon: Icon,
  variant,
  size,
  block,
  loading = false,
  className,
  ...props
}) {
  // While loading the label is hidden, a spinner shows, the width stays and clicks are ignored.
  const classes = buttonClasses({
    variant,
    size,
    block,
    className: `${className || ""} ${loading ? "pointer-events-none" : ""}`,
  });
  const content = (
    <>
      {Icon && (
        <Icon
          className={`${size === "sm" ? "size-icon-sm" : "size-icon-md"} shrink-0 ${loading ? "invisible" : ""}`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      )}
      <span className={loading ? "invisible" : ""}>{children}</span>
      {loading && <Spinner />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={classes}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
}
