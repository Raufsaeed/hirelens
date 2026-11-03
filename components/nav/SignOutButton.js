"use client";

import { useActionState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";

// "Sign out" in every menu. Ends the session and goes to Log in.
export default function SignOutButton({ className }) {
  const [state, formAction, isPending] = useActionState(signOut, null);
  return (
    <form action={formAction} className="flex flex-col gap-1">
      <button type="submit" className={className} aria-busy={isPending || undefined} disabled={isPending}>
        <LogOut className="size-icon-md shrink-0" strokeWidth={1.75} aria-hidden="true" />
        Sign out
      </button>
      {state?.error && (
        <p role="alert" className="px-3 text-[13px] leading-5 font-medium text-nav-text">
          {state.error}
        </p>
      )}
    </form>
  );
}
