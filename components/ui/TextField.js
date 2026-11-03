import { CircleAlert } from "lucide-react";

// A labelled input with an optional leading icon and an inline error (design/components/FormField).

export const INPUT_CLASSES =
  "w-full min-h-control rounded-control border border-border-control bg-surface px-3.5 text-[15px] leading-[22px] text-ink " +
  "appearance-none transition-[border-color,box-shadow] duration-(--duration-fast) ease-out " +
  "placeholder:text-ink-placeholder hover:border-ink-muted " +
  "focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-faint)] focus:outline-none " +
  "aria-invalid:border-danger aria-invalid:focus:shadow-[0_0_0_3px_var(--danger-bg)] " +
  "disabled:cursor-not-allowed disabled:border-surface-sunken disabled:bg-surface-sunken disabled:text-ink-disabled";

export function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="flex animate-fade-up items-start gap-1.5 text-[13px] leading-5 font-medium text-danger-text">
      <CircleAlert className="mt-0.5 size-icon-sm shrink-0 text-danger" strokeWidth={1.75} aria-hidden="true" />
      {message}
    </p>
  );
}

export default function TextField({
  id,
  label,
  icon: Icon,
  error,
  trailing,
  describedBy,
  inputClassName = "",
  children,
  ...inputProps
}) {
  const errorId = `${id}-error`;
  const describedByIds = [describedBy, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="label text-ink">
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.25 size-icon-md text-ink-muted"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByIds}
          className={`${INPUT_CLASSES} ${Icon ? "pl-10.5" : ""} ${inputClassName}`}
          {...inputProps}
        />
        {trailing}
      </div>
      <FieldError id={errorId} message={error} />
      {children}
    </div>
  );
}
