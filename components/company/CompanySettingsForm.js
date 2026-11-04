"use client";

import { useActionState, useState } from "react";
import { Building2, Globe, MapPin } from "lucide-react";
import { useFieldErrors } from "@/components/forms/useFieldErrors";
import Alert from "@/components/ui/Alert";
import SubmitButton from "@/components/ui/SubmitButton";
import TextAreaField from "@/components/ui/TextAreaField";
import TextField from "@/components/ui/TextField";
import { updateCompany } from "@/lib/companies/actions";
import { MAX_ABOUT, validateCompany } from "@/lib/companies/validation";

// Company Settings form (Feature 06): name, About us, website and location.
export default function CompanySettingsForm({ company }) {
  const [values, setValues] = useState({
    name: company.name || "",
    about: company.about || "",
    website: company.website || "",
    location: company.location || "",
  });
  const [state, formAction, isPending] = useActionState(updateCompany, {});
  const { errorFor, checkField, clearField, checkAll } = useFieldErrors(validateCompany, state.errors);

  function field(name) {
    return {
      id: `company-${name}`,
      name,
      value: values[name],
      onChange: (event) => {
        setValues((current) => ({ ...current, [name]: event.target.value }));
        clearField(name);
      },
      onBlur: () => checkField(name, values),
      error: errorFor(name),
    };
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!checkAll(values)) event.preventDefault();
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <TextField {...field("name")} label="Company name" icon={Building2} autoComplete="organization" />
      <div className="flex flex-col gap-1">
        <TextAreaField
          {...field("about")}
          label={
            <>
              About us <span className="font-medium text-ink-muted">(optional)</span>
            </>
          }
          rows={5}
          placeholder="Tell candidates about your team"
        />
        <span
          className={`small self-end tabular-nums ${values.about.length > MAX_ABOUT ? "font-bold text-danger-text" : "text-ink-muted"}`}
        >
          {values.about.length} / {MAX_ABOUT}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...field("website")} type="url" label="Website" icon={Globe} placeholder="https://abctech.com" />
        <TextField {...field("location")} label="Location" icon={MapPin} placeholder="Lahore" />
      </div>
      {state.formError && <Alert tone="error">{state.formError}</Alert>}
      {state.message && <Alert tone="success">{state.message}</Alert>}
      <SubmitButton className="self-end" loading={isPending}>
        Save
      </SubmitButton>
    </form>
  );
}
