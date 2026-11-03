"use client";

import { useState } from "react";
import { Plus, Star, X } from "lucide-react";
import Button from "@/components/ui/Button";
import SelectField from "@/components/ui/SelectField";
import TextField, { FieldError } from "@/components/ui/TextField";
import { MAX_REQUIREMENT_LENGTH, REQUIREMENT_TYPES } from "@/lib/jobs/constants";

// The job's skills and tools, each "must have" or "nice to have" (design/components/RequirementTag).
function RequirementTag({ requirement, onRemove }) {
  const isMust = requirement.type === "must";
  const Icon = isMust ? Star : Plus;
  return (
    <li
      className={`label inline-flex min-h-7 items-center gap-1.5 rounded-pill border py-0.5 pr-1 pl-3 ${
        isMust
          ? "border-primary bg-primary-tint text-on-primary-tint"
          : "border-dashed border-border-control bg-surface text-ink-muted"
      }`}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      {requirement.name} · {isMust ? "must have" : "nice to have"}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${requirement.name}`}
        className="relative grid size-6 place-items-center rounded-pill hover:bg-surface-sunken focus-visible:shadow-focus focus-visible:outline-none after:absolute after:-inset-2.5 after:content-['']"
      >
        <X className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      </button>
    </li>
  );
}

export default function RequirementsEditor({ requirements, onChange, error }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("must");
  const [message, setMessage] = useState(null);

  function add() {
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage("Type a skill or tool first, for example React");
      return;
    }
    if (requirements.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())) {
      setMessage(`${trimmed} is already in the list`);
      return;
    }
    onChange([...requirements, { name: trimmed, type }]);
    setName("");
    setMessage(null);
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="label mb-1.5 text-ink">Requirements</legend>
      <p className="small -mt-1.5 text-ink-muted">
        The skills and tools AI checks every CV for. Must-haves count more than nice-to-haves.
      </p>
      <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
        <TextField
          id="requirementName"
          label="Requirement"
          value={name}
          maxLength={MAX_REQUIREMENT_LENGTH}
          placeholder="React"
          onChange={(event) => {
            setName(event.target.value);
            setMessage(null);
          }}
          onKeyDown={(event) => {
            // Enter adds the requirement instead of sending the whole form.
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <SelectField
          id="requirementType"
          label="Requirement type"
          options={REQUIREMENT_TYPES}
          value={type}
          onChange={(event) => setType(event.target.value)}
        />
        <Button variant="secondary" icon={Plus} onClick={add}>
          Add requirement
        </Button>
      </div>
      <FieldError id="requirementName-message" message={message} />

      {requirements.length > 0 && (
        <ul aria-label="Added requirements" className="flex flex-wrap gap-2">
          {requirements.map((requirement) => (
            <RequirementTag
              key={requirement.name}
              requirement={requirement}
              onRemove={() => onChange(requirements.filter((item) => item !== requirement))}
            />
          ))}
        </ul>
      )}
      <FieldError id="requirements-error" message={error} />
    </fieldset>
  );
}
