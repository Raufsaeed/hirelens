"use client";

import { useActionState, useState } from "react";
import { Mail } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import { useFieldErrors } from "@/components/auth/useFieldErrors";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import { requestPasswordReset } from "@/lib/auth/actions";
import { validateEmailOnly } from "@/lib/auth/validation";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [state, formAction, isPending] = useActionState(requestPasswordReset, {});
  const validate = (values) => validateEmailOnly(values.email);
  const { errorFor, checkField, clearField, checkAll } = useFieldErrors(validate, state.errors);

  function handleSubmit(event) {
    if (!checkAll({ email })) event.preventDefault();
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to set a new password."
    >
      <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          id="email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            clearField("email");
          }}
          onBlur={() => checkField("email", { email })}
          error={errorFor("email")}
        />

        {/* Always the same message, so nobody can find out which emails have an account. */}
        {state.sent && (
          <Alert tone="success">If an account exists for this email, we&apos;ve sent a reset link</Alert>
        )}
        {state.formError && <Alert tone="error">{state.formError}</Alert>}

        <Button type="submit" size="lg" block loading={isPending}>
          Send reset link
        </Button>
      </form>

      <p className="small text-center text-ink-muted">
        Remembered it? <TextLink href="/login">Back to log in</TextLink>
      </p>
    </AuthCard>
  );
}
