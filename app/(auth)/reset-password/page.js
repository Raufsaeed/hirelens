import { Suspense } from "react";
import { cookies } from "next/headers";
import AuthCard, { AuthCardSkeleton } from "@/components/auth/AuthCard";
import ExpiredLinkNotice from "@/components/auth/ExpiredLinkNotice";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { RESET_COOKIE } from "@/lib/auth/reset-cookie";

export const metadata = { title: "Set a new password · HireLens" };

// Opened from the reset email (through /auth/callback), which sets the reset marker cookie.
export default function ResetPasswordPage({ searchParams }) {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <ResetPassword searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetPassword({ searchParams }) {
  const params = await searchParams;
  const cookieStore = await cookies();

  if (params.expired || !cookieStore.has(RESET_COOKIE)) {
    return (
      <AuthCard title="Set a new password">
        <ExpiredLinkNotice />
      </AuthCard>
    );
  }
  return <ResetPasswordForm />;
}
