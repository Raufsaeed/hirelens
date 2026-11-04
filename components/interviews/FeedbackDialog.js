"use client";

import { useState } from "react";
import { MessageSquareText, Star } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import TextAreaField from "@/components/ui/TextAreaField";
import { saveFeedback } from "@/lib/interviews/actions";
import { MAX_FEEDBACK_LENGTH, RECOMMENDATIONS, validateFeedback } from "@/lib/interviews/feedback";

const SAVE_ERROR = "Something went wrong, please try again";
const RATINGS = [1, 2, 3, 4, 5];

// A pill-shaped radio choice (44px tall) used for the rating and the recommendation.
function Choice({ name, value, checked, onChange, label, children }) {
  return (
    <label
      className={`inline-flex min-h-touch cursor-pointer items-center gap-1.5 rounded-pill border px-3.5 font-bold transition-colors duration-(--duration-fast) ease-out has-focus-visible:shadow-focus ${
        checked ? "border-primary bg-primary-tint text-on-primary-tint" : "border-border-control bg-surface text-ink hover:border-ink-muted"
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} aria-label={label} className="sr-only" />
      {children}
    </label>
  );
}

// Interview Feedback form (Feature 17) for HR. Render it only while open, so it starts blank.
// The recommendation is advice only: it never moves the candidate.
export default function FeedbackDialog({ interviewId, candidateName, onClose, onSaved }) {
  const [values, setValues] = useState({ rating: "", strengths: "", concerns: "", recommendation: "" });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function set(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setError(null);
  }

  async function save(event) {
    event.preventDefault();
    const invalid = validateFeedback(values);
    if (invalid) {
      setError(invalid);
      return;
    }
    setSaving(true);
    const result = await saveFeedback({ interviewId, ...values }).catch(() => ({ error: SAVE_ERROR }));
    setSaving(false);
    if (result.error) setError(result.error);
    else onSaved();
  }

  return (
    <Dialog open onClose={onClose} icon={MessageSquareText} title={`Interview feedback for ${candidateName}`}>
      <form noValidate onSubmit={save} className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="label mb-1.5 text-ink">Rating</legend>
          <div className="flex flex-wrap gap-2">
            {RATINGS.map((rating) => (
              <Choice
                key={rating}
                name="rating"
                value={rating}
                checked={values.rating === String(rating)}
                onChange={() => set("rating", String(rating))}
                label={`${rating} out of 5`}
              >
                <Star className="size-icon-sm" strokeWidth={1.75} aria-hidden="true" />
                {rating}
              </Choice>
            ))}
          </div>
        </fieldset>

        <TextAreaField
          id="feedback-strengths"
          label="Strengths"
          rows={3}
          maxLength={MAX_FEEDBACK_LENGTH}
          value={values.strengths}
          onChange={(event) => set("strengths", event.target.value)}
        />
        <TextAreaField
          id="feedback-concerns"
          label="Concerns"
          rows={3}
          maxLength={MAX_FEEDBACK_LENGTH}
          value={values.concerns}
          onChange={(event) => set("concerns", event.target.value)}
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="label mb-1.5 text-ink">Recommendation</legend>
          <div className="flex flex-wrap gap-2">
            {RECOMMENDATIONS.map((item) => (
              <Choice
                key={item.value}
                name="recommendation"
                value={item.value}
                checked={values.recommendation === item.value}
                onChange={() => set("recommendation", item.value)}
                label={item.label}
              >
                {item.label}
              </Choice>
            ))}
          </div>
          <p className="small text-ink-muted">Advice only. Move the candidate on the Pipeline when you decide.</p>
        </fieldset>

        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={MessageSquareText} loading={saving}>
            Save feedback
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
