"use client";

import { useActionState, useState } from "react";
import { Mail } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import AuthTabs from "@/components/auth/AuthTabs";
import { useFieldErrors } from "@/components/forms/useFieldErrors";
import Alert from "@/components/ui/Alert";
import SubmitButton from "@/components/ui/SubmitButton";
import PasswordField from "@/components/ui/PasswordField";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import { logIn } from "@/lib/auth/actions";
import { validateLogIn } from "@/lib/auth/validation";

export default function LoginForm({ next, askedToLogIn }) {
  const [values, setValues] = useState({ email: "", password: "" });
  const [state, formAction, isPending] = useActionState(logIn, {});
  const { errorFor, checkField, clearField, checkAll } = useFieldErrors(validateLogIn, state.errors);

  function update(field) {
    return (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      clearField(field);
    };
  }

  function handleSubmit(event) {
    if (!checkAll(values)) event.preventDefault();
  }

  const signupQuery = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <AuthCard title="Log in to HireLens" subtitle="Welcome back.">
      <AuthTabs active="login" next={next} />

      {askedToLogIn && <Alert tone="info">Please log in to continue</Alert>}

      <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {next && <input type="hidden" name="next" value={next} />}

        <TextField
          id="email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          autoComplete="email"
          value={values.email}
          onChange={update("email")}
          onBlur={() => checkField("email", values)}
          error={errorFor("email")}
        />
        <div className="flex flex-col gap-2">
          <PasswordField
            id="password"
            name="password"
            autoComplete="current-password"
            value={values.password}
            onChange={update("password")}
            onBlur={() => checkField("password", values)}
            error={errorFor("password")}
          />
          <TextLink href="/forgot-password" className="small self-end">
            Forgot password
          </TextLink>
        </div>

        {state.formError === "invalidCredentials" && (
          <Alert tone="error" title="Email or password is incorrect">
            <TextLink href="/forgot-password">Forgot password?</TextLink>
          </Alert>
        )}
        {state.formError && state.formError !== "invalidCredentials" && (
          <Alert tone="error">{state.formError}</Alert>
        )}

        <SubmitButton size="lg" block loading={isPending}>
          Log in
        </SubmitButton>
      </form>

      <p className="small text-center text-ink-muted">
        New to HireLens? <TextLink href={`/signup${signupQuery}`}>Sign up</TextLink>
      </p>
    </AuthCard>
  );
}
