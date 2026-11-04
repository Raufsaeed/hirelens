"use client";

import { useActionState, useState } from "react";
import { Award, Briefcase, Clock, GraduationCap, MapPin, Send } from "lucide-react";
import { useFieldErrors } from "@/components/forms/useFieldErrors";
import AiDescriptionWriter from "@/components/jobs/AiDescriptionWriter";
import RequirementsEditor from "@/components/jobs/RequirementsEditor";
import RescreenDialog from "@/components/jobs/RescreenDialog";
import Alert from "@/components/ui/Alert";
import SubmitButton from "@/components/ui/SubmitButton";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import TextField from "@/components/ui/TextField";
import { createJob, updateJob } from "@/lib/jobs/actions";
import { JOB_TYPES } from "@/lib/jobs/constants";
import { pakistanToday } from "@/lib/jobs/dates";
import { validateJob } from "@/lib/jobs/validation";

const EMPTY_JOB = {
  title: "",
  location: "",
  jobType: "",
  requiredYears: "",
  requiredDegree: "",
  description: "",
  applyBy: "",
};

// The saved job as form values (Edit Job).
function valuesFrom(job) {
  return {
    title: job.title || "",
    location: job.location || "",
    jobType: job.job_type || "",
    requiredYears: job.required_years === null || job.required_years === undefined ? "" : String(job.required_years),
    requiredDegree: job.required_degree || "",
    description: job.description || "",
    applyBy: job.apply_by || "",
  };
}

// The job form. Without `job`: Create Job with "Save as draft" (title only) and "Publish" (everything).
// With `job`: Edit Job, filled in. A draft keeps "Save as draft" / "Publish"; open and closed jobs get
// "Save changes" with the publishing rules (Feature 03).
export default function JobForm({ job = null }) {
  const editing = Boolean(job);
  const isDraft = !editing || job.status === "draft";
  const [values, setValues] = useState(editing ? valuesFrom(job) : EMPTY_JOB);
  const [requirements, setRequirements] = useState(editing ? job.requirements || [] : []);
  const [intent, setIntent] = useState("publish");
  const [state, formAction, isPending] = useActionState(editing ? updateJob : createJob, {});
  const keepApplyBy = editing ? job.apply_by : null;

  // Blur checks use the Publish rules, so HR sees what is still missing as she types.
  const validate = (current) => validateJob(current, intent, pakistanToday(), { keepApplyBy });
  const { errorFor, checkField, clearField, checkAll } = useFieldErrors(validate, state.errors);

  function field(name) {
    return {
      id: name,
      name,
      value: values[name],
      onChange: (event) => {
        setValues((current) => ({ ...current, [name]: event.target.value }));
        clearField(name);
      },
      onBlur: () => checkField(name, { ...values, requirements }),
      error: errorFor(name),
    };
  }

  function handleSubmit(event) {
    const submitIntent = event.nativeEvent.submitter?.value === "draft" ? "draft" : "publish";
    setIntent(submitIntent);
    const rules = (current) => validateJob(current, submitIntent, pakistanToday(), { keepApplyBy });
    if (!checkAll({ ...values, requirements }, rules)) event.preventDefault();
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6"
    >
      <input type="hidden" name="requirements" value={JSON.stringify(requirements)} />
      {editing && <input type="hidden" name="jobId" value={job.id} />}

      <TextField
        {...field("title")}
        label="Job title"
        icon={Briefcase}
        placeholder="Junior Web Developer"
        hint="Use the title candidates search for."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...field("location")} label="Location" icon={MapPin} placeholder="Lahore" />
        <SelectField {...field("jobType")} label="Job type" options={JOB_TYPES} placeholder="Choose a type" />
        <TextField
          {...field("requiredYears")}
          label="Required years of experience"
          icon={Award}
          inputMode="numeric"
          placeholder="1"
          hint="A whole number from 0 to 30."
        />
        <TextField
          {...field("requiredDegree")}
          label="Required degree"
          icon={GraduationCap}
          placeholder="BS Computer Science"
        />
      </div>

      <RequirementsEditor
        requirements={requirements}
        onChange={(next) => {
          setRequirements(next);
          clearField("requirements");
        }}
        error={errorFor("requirements")}
      />

      {!editing && (
        <AiDescriptionWriter
          form={{ ...values, requirements }}
          onDraft={(text) => {
            setValues((current) => ({ ...current, description: text }));
            clearField("description");
          }}
          onAccept={(suggestion) => {
            setRequirements((current) => [...current, suggestion]);
            clearField("requirements");
          }}
        />
      )}

      <TextAreaField
        {...field("description")}
        label="Description"
        rows={6}
        placeholder="What the person will do, the team, and what you offer."
      />

      <TextField
        {...field("applyBy")}
        type="date"
        label={
          <>
            Apply by <span className="font-medium text-ink-muted">(optional)</span>
          </>
        }
        icon={Clock}
        min={pakistanToday()}
        hint="Applications close at the end of this day."
      />

      {state.formError && <Alert tone="error">{state.formError}</Alert>}

      {state.saved && state.rescreen && (
        <RescreenDialog applicationIds={state.rescreen.applicationIds} message={state.message} jobId={job.id} />
      )}

      {!isDraft ? (
        <div className="flex justify-end">
          <SubmitButton name="intent" value="save" disabled={isPending} loading={isPending}>
            Save changes
          </SubmitButton>
        </div>
      ) : (
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <SubmitButton
          name="intent"
          value="draft"
          variant="secondary"
          disabled={isPending}
          loading={isPending && intent === "draft"}
        >
          Save as draft
        </SubmitButton>
        <SubmitButton
          name="intent"
          value="publish"
          icon={Send}
          disabled={isPending}
          loading={isPending && intent === "publish"}
        >
          Publish
        </SubmitButton>
      </div>
      )}
    </form>
  );
}
