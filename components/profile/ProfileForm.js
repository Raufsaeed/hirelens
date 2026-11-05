"use client";

import { useActionState, useState } from "react";
import { MapPin, Phone, User } from "lucide-react";
import { useFieldErrors } from "@/components/forms/useFieldErrors";
import Alert from "@/components/ui/Alert";
import SubmitButton from "@/components/ui/SubmitButton";
import TextField from "@/components/ui/TextField";
import { saveProfile } from "@/lib/profile/actions";
import { MAX_HEADLINE, validateProfile } from "@/lib/profile/validation";

// My Profile details (Feature 20): full name, phone, city and a short headline.
export default function ProfileForm({ profile }) {
  const [values, setValues] = useState({
    fullName: profile.full_name || "",
    phone: profile.phone || "",
    city: profile.city || "",
    headline: profile.headline || "",
  });
  const [state, formAction, isPending] = useActionState(saveProfile, {});
  const { errorFor, checkField, clearField, checkAll } = useFieldErrors(validateProfile, state.errors);

  function field(name) {
    return {
      id: `profile-${name}`,
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
      className="flex flex-col gap-4"
    >
      <h2 className="card-title">Your details</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...field("fullName")} label="Full name" icon={User} autoComplete="name" />
        <TextField {...field("phone")} type="tel" label="Phone" icon={Phone} autoComplete="tel" placeholder="0300 1234567" />
      </div>
      <TextField
        {...field("city")}
        label="City"
        icon={MapPin}
        autoComplete="address-level2"
        placeholder="Lahore"
        hint="Never sent to AI or used in screening."
      />
      <div className="flex flex-col gap-1">
        <TextField {...field("headline")} label="Headline" placeholder="Junior React developer" />
        <span
          className={`small self-end tabular-nums ${values.headline.length > MAX_HEADLINE ? "font-bold text-danger-text" : "text-ink-muted"}`}
        >
          {values.headline.length} / {MAX_HEADLINE}
        </span>
      </div>
      {state.formError && <Alert tone="error">{state.formError}</Alert>}
      {state.message && <Alert tone="success">{state.message}</Alert>}
      <SubmitButton loading={isPending} className="self-start">
        Save profile
      </SubmitButton>
    </form>
  );
}
