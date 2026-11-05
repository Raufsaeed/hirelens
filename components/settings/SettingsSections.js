"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, Trash2, User } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import PasswordField from "@/components/ui/PasswordField";
import SubmitButton from "@/components/ui/SubmitButton";
import TextField from "@/components/ui/TextField";
import EmailPreferencesSection from "@/components/settings/EmailPreferencesSection";
import { changePassword, deleteAccount, requestEmailChange, updateName } from "@/lib/settings/actions";

// Account Settings (Feature 22): name, email, password, and Delete account (candidates) or the
// Company Settings link (HR), plus Email preferences (Feature 23).

function Section({ icon: Icon, title, children }) {
  return (
    <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
      <div className="flex items-center gap-2">
        <Icon className="size-icon-md text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
        <h2 className="card-title">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Result({ state }) {
  if (state.formError) return <Alert tone="error">{state.formError}</Alert>;
  if (state.message) return <Alert tone="success">{state.message}</Alert>;
  return null;
}

function NameSection({ fullName }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(async (previous, formData) => {
    const result = await updateName(previous, formData);
    if (result.message) router.refresh(); // the menu shows the new name
    return result;
  }, {});
  return (
    <Section icon={User} title="Name">
      <form action={formAction} noValidate className="flex flex-col gap-4">
        <TextField id="fullName" name="fullName" label="Full name" defaultValue={fullName} autoComplete="name" error={state.errors?.fullName} />
        <Result state={state} />
        <SubmitButton variant="secondary" className="self-start" loading={isPending}>
          Save name
        </SubmitButton>
      </form>
    </Section>
  );
}

function EmailSection({ email, pendingEmail, justUpdated }) {
  const [state, formAction, isPending] = useActionState(requestEmailChange, {});
  return (
    <Section icon={Mail} title="Email">
      <p>
        <span className="text-ink-muted">Current email: </span>
        <strong className="[overflow-wrap:anywhere]">{email}</strong>
      </p>
      {justUpdated && <Alert tone="success">Email updated</Alert>}
      {pendingEmail && !state.message && (
        <Alert tone="info" title="Check your new email to confirm the change">
          We sent a link to {pendingEmail}. Until you click it, keep using {email}.
        </Alert>
      )}
      <form action={formAction} noValidate className="flex flex-col gap-4">
        <TextField id="newEmail" name="newEmail" type="email" label="New email" icon={Mail} autoComplete="email" error={state.errors?.newEmail} />
        {state.message ? (
          <Alert tone="info" title={state.message}>
            Your email changes only after you click the link. Until then, keep using {email}.
          </Alert>
        ) : (
          <Result state={state} />
        )}
        <SubmitButton variant="secondary" className="self-start" loading={isPending}>
          Send confirmation link
        </SubmitButton>
      </form>
    </Section>
  );
}

function PasswordSection() {
  const [values, setValues] = useState({ currentPassword: "", password: "", confirmPassword: "" });
  const [state, formAction, isPending] = useActionState(async (previous, formData) => {
    const result = await changePassword(previous, formData);
    if (result.message) setValues({ currentPassword: "", password: "", confirmPassword: "" });
    return result;
  }, {});
  const update = (name) => (event) => setValues((current) => ({ ...current, [name]: event.target.value }));
  return (
    <Section icon={Lock} title="Password">
      <form action={formAction} noValidate className="flex flex-col gap-4">
        <PasswordField
          id="currentPassword"
          name="currentPassword"
          label="Current password"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={update("currentPassword")}
          error={state.errors?.currentPassword}
        />
        <PasswordField
          id="newPassword"
          name="password"
          label="New password"
          autoComplete="new-password"
          showRules
          value={values.password}
          onChange={update("password")}
          error={state.errors?.password}
        />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={update("confirmPassword")}
          error={state.errors?.confirmPassword}
        />
        <Result state={state} />
        <SubmitButton variant="secondary" className="self-start" loading={isPending}>
          Save password
        </SubmitButton>
      </form>
    </Section>
  );
}

function DeleteSection() {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      try {
        // On success the server logs the user out and opens "Your account has been deleted".
        const result = await deleteAccount(confirmText);
        if (result?.error) setError(result.error);
      } catch {
        setError("Couldn't delete your account, try again");
      }
    });
  }

  return (
    <Section icon={Trash2} title="Delete account">
      <p className="text-ink-muted">
        This removes your account, your applications, your CVs and everything companies saved about them. It
        can&apos;t be undone.
      </p>
      <TextField
        id="confirmDelete"
        label="Type DELETE to confirm"
        value={confirmText}
        autoComplete="off"
        onChange={(event) => setConfirmText(event.target.value)}
      />
      {error && <Alert tone="error">{error}</Alert>}
      <Button variant="danger" icon={Trash2} className="self-start" disabled={confirmText !== "DELETE"} loading={isPending} onClick={remove}>
        Delete account
      </Button>
    </Section>
  );
}

export default function SettingsSections({ profile, email, preferences }) {
  return (
    <div className="flex flex-col gap-6">
      <NameSection fullName={profile.full_name} />
      <EmailSection email={email.email} pendingEmail={email.pendingEmail} justUpdated={email.justUpdated} />
      <PasswordSection />
      <EmailPreferencesSection
        role={profile.role}
        initialOn={profile.role === "hr" ? preferences.dailySummary : preferences.statusUpdates}
      />
      {profile.role === "hr" ? (
        <Section icon={Building2} title="Company">
          <p className="text-ink-muted">Your company&apos;s name, logo and public page.</p>
          <Button href="/hr/company" variant="secondary" icon={Building2} className="self-start">
            Company settings
          </Button>
        </Section>
      ) : (
        <DeleteSection />
      )}
    </div>
  );
}
