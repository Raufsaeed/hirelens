"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import ExpiredLinkNotice from "@/components/auth/ExpiredLinkNotice";
import { useFieldErrors } from "@/components/forms/useFieldErrors";
import Alert from "@/components/ui/Alert";
import SubmitButton from "@/components/ui/SubmitButton";
import PasswordField from "@/components/ui/PasswordField";
import { resetPassword } from "@/lib/auth/actions";
import { validateNewPassword } from "@/lib/auth/validation";

// How long "Password updated" shows before going to the user's dashboard.
const SUCCESS_PAUSE_MS = 1200;

export default function ResetPasswordForm() {
  const router = useRouter();
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [state, formAction, isPending] = useActionState(resetPassword, {});
  const { errorFor, checkField, clearField, checkAll } = useFieldErrors(validateNewPassword, state.errors);

  useEffect(() => {
    if (!state.success) return;
    const timer = setTimeout(() => router.replace(state.redirectTo), SUCCESS_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [state, router]);

  function update(field) {
    return (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      clearField(field);
    };
  }

  function handleSubmit(event) {
    if (!checkAll(values)) event.preventDefault();
  }

  if (state.expired) {
    return (
      <AuthCard title="Set a new password">
        <ExpiredLinkNotice />
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account.">
      <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <PasswordField
          id="password"
          name="password"
          label="New password"
          autoComplete="new-password"
          showRules
          value={values.password}
          onChange={update("password")}
          onBlur={() => checkField("password", values)}
          error={errorFor("password")}
        />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={update("confirmPassword")}
          onBlur={() => checkField("confirmPassword", values)}
          error={errorFor("confirmPassword")}
        />

        {state.success && (
          <Alert tone="success" title="Password updated">
            Taking you to your dashboard…
          </Alert>
        )}
        {state.formError && <Alert tone="error">{state.formError}</Alert>}

        <SubmitButton  size="lg" block loading={isPending || state.success}>
          Save password
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
