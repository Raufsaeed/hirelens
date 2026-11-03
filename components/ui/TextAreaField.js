import { FieldError, INPUT_CLASSES } from "@/components/ui/TextField";

// A labelled multi-line field, at least 120px tall (design/components/FormField).
export default function TextAreaField({ id, label, error, hint, ...textareaProps }) {
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : null;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="label text-ink">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, error ? errorId : null].filter(Boolean).join(" ") || undefined}
        className={`${INPUT_CLASSES} min-h-30 resize-y py-3`}
        {...textareaProps}
      />
      {hint && (
        <p id={hintId} className="small text-ink-muted">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
