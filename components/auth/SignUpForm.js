"use client";

import { useActionState, useState } from "react";
import { Briefcase, Building2, Mail, Search, User } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import AuthTabs from "@/components/auth/AuthTabs";
import { useFieldErrors } from "@/components/forms/useFieldErrors";
import Alert from "@/components/ui/Alert";
import SubmitButton from "@/components/ui/SubmitButton";
import PasswordField from "@/components/ui/PasswordField";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import { signUp } from "@/lib/auth/actions";
import { validateSignUp } from "@/lib/auth/validation";

const ROLES = [
  { id: "hr", label: "I'm hiring", icon: Briefcase },
  { id: "candidate", label: "I'm looking for a job", icon: Search },
];

const COPY = {
  hr: { title: "Create your HR account", subtitle: "Post your first job in under two minutes." },
  candidate: { title: "Create your account", subtitle: "Apply with your CV and follow every application." },
  none: { title: "Create your account", subtitle: "Choose how you'll use HireLens." },
};

function RoleChoice({ role, onChange }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="label mb-3 text-ink">I want to use HireLens because</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLES.map(({ id, label, icon: Icon }) => (
          <label
            key={id}
            className="flex min-h-touch cursor-pointer items-center gap-3 rounded-control border border-border-control bg-surface px-4 py-3 font-bold text-ink transition-[border-color,background-color,box-shadow] duration-(--duration-fast) ease-out hover:border-ink-muted has-checked:border-primary has-checked:bg-primary-tint has-checked:text-on-primary-tint has-focus-visible:shadow-focus"
          >
            <input
              type="radio"
              name="roleChoice"
              value={id}
              checked={role === id}
              onChange={() => onChange(id)}
              className="sr-only"
            />
            <Icon className="size-icon-md shrink-0" strokeWidth={1.75} aria-hidden="true" />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function SignUpForm({ initialRole, next }) {
  const [role, setRole] = useState(initialRole);
  const [values, setValues] = useState({ fullName: "", email: "", password: "", companyName: "" });
  const [state, formAction, isPending] = useActionState(signUp, {});
  const validate = (current) => validateSignUp(current, role);
  const { errorFor, checkField, clearField, checkAll } = useFieldErrors(validate, state.errors);

  function update(field) {
    return (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      clearField(field);
    };
  }

  function handleSubmit(event) {
    const fields = role === "hr" ? values : { ...values, companyName: undefined };
    if (!checkAll(fields)) event.preventDefault();
  }

  const loginQuery = next ? `?next=${encodeURIComponent(next)}` : "";
  const copy = COPY[role || "none"];

  return (
    <AuthCard title={copy.title} subtitle={copy.subtitle}>
      <AuthTabs active="signup" next={next} role={role} />
      <RoleChoice role={role} onChange={setRole} />

      {role && (
        <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <input type="hidden" name="role" value={role} />
          {next && <input type="hidden" name="next" value={next} />}

          <TextField
            id="fullName"
            name="fullName"
            label="Full name"
            icon={User}
            autoComplete="name"
            value={values.fullName}
            onChange={update("fullName")}
            onBlur={() => checkField("fullName", values)}
            error={errorFor("fullName")}
          />
          <TextField
            id="email"
            name="email"
            type="email"
            label={role === "hr" ? "Work email" : "Email"}
            icon={Mail}
            autoComplete="email"
            value={values.email}
            onChange={update("email")}
            onBlur={() => checkField("email", values)}
            error={errorFor("email")}
          />
          <PasswordField
            id="password"
            name="password"
            autoComplete="new-password"
            showRules
            value={values.password}
            onChange={update("password")}
            onBlur={() => checkField("password", values)}
            error={errorFor("password")}
          />
          {role === "hr" && (
            <TextField
              id="companyName"
              name="companyName"
              label="Company name"
              icon={Building2}
              autoComplete="organization"
              value={values.companyName}
              onChange={update("companyName")}
              onBlur={() => checkField("companyName", values)}
              error={errorFor("companyName")}
            />
          )}

          {state.formError === "emailInUse" && (
            <Alert tone="error">
              Email already in use. <TextLink href={`/login${loginQuery}`}>Log in</TextLink> instead?
            </Alert>
          )}
          {state.formError && state.formError !== "emailInUse" && (
            <Alert tone="error">{state.formError}</Alert>
          )}

          <SubmitButton  size="lg" block loading={isPending}>
            Create account
          </SubmitButton>
        </form>
      )}

      <p className="small text-center text-ink-muted">
        Already have an account? <TextLink href={`/login${loginQuery}`}>Log in</TextLink>
      </p>
    </AuthCard>
  );
}
