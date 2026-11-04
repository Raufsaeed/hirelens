"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Send, User } from "lucide-react";
import CvDropzone from "@/components/applications/CvDropzone";
import { useFieldErrors } from "@/components/forms/useFieldErrors";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import SubmitButton from "@/components/ui/SubmitButton";
import TextAreaField from "@/components/ui/TextAreaField";
import TextField from "@/components/ui/TextField";
import { FieldError } from "@/components/ui/TextField";
import { uploadWithProgress } from "@/components/forms/upload";
import { MAX_COVER_NOTE, validateApplication } from "@/lib/applications/validation";

// Apply form (Feature 08): name and email from the account, phone, optional cover note and the PDF CV.
export default function ApplyForm({ job, defaults }) {
  const router = useRouter();
  const [values, setValues] = useState({ ...defaults, phone: "", coverNote: "" });
  const [cv, setCv] = useState(null);
  const [progress, setProgress] = useState(null);
  const [serverResult, setServerResult] = useState({});
  const { errorFor, checkField, clearField, checkAll } = useFieldErrors(validateApplication, serverResult.errors);
  const sending = progress !== null;

  function field(name) {
    return {
      id: name,
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

  async function handleSubmit(event) {
    event.preventDefault();
    if (!checkAll(values) || !cv) return;

    const formData = new FormData();
    formData.set("jobId", job.id);
    Object.entries(values).forEach(([name, value]) => formData.set(name, value));
    formData.set("cv", cv);

    setServerResult({});
    setProgress(0);
    const result = await uploadWithProgress("/api/applications", formData, setProgress);
    if (result.applicationId) {
      router.push(`/jobs/${job.slug}/apply/sent?file=${encodeURIComponent(cv.name)}`);
      return;
    }
    // Keep everything the candidate typed so they can fix it and try again.
    setProgress(null);
    setServerResult(result);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6"
    >
      <section className="flex flex-col gap-4">
        <h2 className="card-title">Your details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField {...field("fullName")} label="Full name" icon={User} autoComplete="name" />
          <TextField {...field("email")} type="email" label="Email" icon={Mail} autoComplete="email" />
        </div>
        <TextField
          {...field("phone")}
          type="tel"
          label="Phone"
          icon={Phone}
          autoComplete="tel"
          placeholder="0300 1234567"
          hint={`${job.companies?.name} may call you about an interview.`}
        />
        <div className="flex flex-col gap-1">
          <TextAreaField
            {...field("coverNote")}
            label={
              <>
                Cover note <span className="font-medium text-ink-muted">(optional)</span>
              </>
            }
            rows={4}
            placeholder="A few lines about why you fit this job."
          />
          <span
            className={`small self-end tabular-nums ${
              values.coverNote.length > MAX_COVER_NOTE ? "font-bold text-danger-text" : "text-ink-muted"
            }`}
          >
            {values.coverNote.length} / {MAX_COVER_NOTE}
          </span>
        </div>
      </section>

      <hr className="h-px border-0 bg-border" />

      <section className="flex flex-col gap-4">
        <h2 className="card-title">Your CV</h2>
        <CvDropzone
          file={cv}
          progress={progress}
          disabled={sending}
          onChange={(file) => {
            setCv(file);
            clearField("cv");
          }}
        />
        <FieldError id="cv-error" message={errorFor("cv")} />
      </section>

      {serverResult.error && (
        <Alert
          tone="error"
          action={
            serverResult.applied && (
              <Button href="/my-applications" variant="secondary" size="sm">
                My Applications
              </Button>
            )
          }
        >
          {serverResult.error}
        </Alert>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="small max-w-90 text-ink-muted">
          By applying you agree that {job.companies?.name} can see your CV. Your score is never shown to you or
          anyone outside their HR team.
        </p>
        <SubmitButton size="lg" icon={Send} disabled={!cv || sending} loading={sending} className="w-full sm:w-auto">
          Submit application
        </SubmitButton>
      </div>
    </form>
  );
}
