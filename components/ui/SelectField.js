import { ChevronDown } from "lucide-react";
import { FieldError, INPUT_CLASSES } from "@/components/ui/TextField";

// A labelled native <select> with the chevron on the right (design/components/FormField).
export default function SelectField({ id, label, options, placeholder, error, hint, ...selectProps }) {
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : null;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="label text-ink">
        {label}
      </label>
      <div className="relative flex items-center">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, error ? errorId : null].filter(Boolean).join(" ") || undefined}
          className={`${INPUT_CLASSES} cursor-pointer pr-10`}
          {...selectProps}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.25 size-icon-sm text-ink-muted"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
      {hint && (
        <p id={hintId} className="small text-ink-muted">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
