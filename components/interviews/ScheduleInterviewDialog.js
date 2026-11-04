"use client";

import { useState } from "react";
import { CalendarClock, Clock, Link2, MapPin, User } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import SelectField from "@/components/ui/SelectField";
import TextField from "@/components/ui/TextField";
import { saveInterview } from "@/lib/interviews/actions";
import { pakistanToday } from "@/lib/jobs/dates";
import {
  CLASH_ERROR,
  DEFAULT_DURATION,
  DURATIONS,
  MAX_ADDRESS_LENGTH,
  MAX_LINK_LENGTH,
  MAX_NAME_LENGTH,
  toDateAndTime,
  validateInterview,
} from "@/lib/interviews/validation";

const SAVE_ERROR = "Something went wrong, please try again";

function startValues(interview, defaultInterviewer) {
  if (!interview) {
    return { date: "", time: "", duration: DEFAULT_DURATION, meetingLink: "", location: "", interviewerName: defaultInterviewer || "" };
  }
  return {
    ...toDateAndTime(interview.scheduledAt),
    duration: String(interview.durationMinutes),
    meetingLink: interview.meetingLink || "",
    location: interview.location || "",
    interviewerName: interview.interviewerName || "",
  };
}

// Schedule Interview form (Feature 16) in a dialog. Without `interview` it schedules a new one
// (and the server moves the candidate to Interview); with `interview` it reschedules that one.
// Render it only while open, so each opening starts fresh. onSaved(result) runs after saving.
export default function ScheduleInterviewDialog({ applicationId, candidateName, interview = null, defaultInterviewer, onClose, onSaved }) {
  const [values, setValues] = useState(() => startValues(interview, defaultInterviewer));
  const [errors, setErrors] = useState({});
  const [clash, setClash] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  function field(name) {
    return {
      id: `interview-${name}`,
      name,
      value: values[name],
      error: errors[name],
      onChange: (event) => {
        setValues((current) => ({ ...current, [name]: event.target.value }));
        setErrors((current) => ({ ...current, [name]: undefined }));
        setClash(null);
      },
    };
  }

  async function save(ignoreClash = false) {
    const found = validateInterview(values);
    if (found) {
      setErrors(found);
      return;
    }
    setSaving(true);
    setFormError(null);
    const result = await saveInterview({ applicationId, interviewId: interview?.id, ignoreClash, ...values }).catch(() => ({
      error: SAVE_ERROR,
    }));
    setSaving(false);
    if (result.errors) setErrors(result.errors);
    else if (result.clash) setClash(result.clash);
    else if (result.error) setFormError(result.error);
    else onSaved(result);
  }

  return (
    <Dialog
      open
      onClose={onClose}
      icon={CalendarClock}
      title={interview ? `Reschedule interview with ${candidateName}` : `Schedule interview with ${candidateName}`}
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField {...field("date")} type="date" label="Date" min={pakistanToday()} />
          <TextField {...field("time")} type="time" label="Time" icon={Clock} />
        </div>
        <SelectField {...field("duration")} label="Duration" options={DURATIONS} />
        <TextField
          {...field("meetingLink")}
          type="url"
          label="Meeting link"
          icon={Link2}
          maxLength={MAX_LINK_LENGTH}
          placeholder="https://meet.google.com/..."
        />
        <TextField
          {...field("location")}
          label="Office address"
          icon={MapPin}
          maxLength={MAX_ADDRESS_LENGTH}
          placeholder="ABC Tech, 12 Main Boulevard, Lahore"
          hint="Add a meeting link, an office address, or both."
        />
        <TextField {...field("interviewerName")} label="Interviewer name" icon={User} maxLength={MAX_NAME_LENGTH} />

        {clash && (
          <Alert
            tone="warning"
            title={CLASH_ERROR}
            action={
              <Button size="sm" variant="secondary" loading={saving} onClick={() => save(true)}>
                Schedule anyway
              </Button>
            }
          >
            {values.interviewerName.trim()} is interviewing {clash.name} at {clash.when}. Change the time, or schedule anyway.
          </Alert>
        )}
        {formError && <Alert tone="error">{formError}</Alert>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={CalendarClock} loading={saving && !clash}>
            Save interview
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
