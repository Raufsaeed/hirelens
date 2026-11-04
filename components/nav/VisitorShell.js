import Brand from "@/components/ui/Brand";
import Button from "@/components/ui/Button";
import { TOP_LINK } from "@/components/nav/navStyles";
import Link from "next/link";

// Public pages for visitors who are logged out (or HR): the slim purple bar with Jobs,
// and Log in / Sign up (or a link back to the HR Dashboard).
export default function VisitorShell({ isHr, children }) {
  return (
    <div className="min-h-dvh bg-surface-page">
      <header className="sticky top-0 z-(--z-nav) h-nav bg-nav-bg text-nav-text">
        <div className="mx-auto flex h-full max-w-hr items-center gap-3 px-4 md:gap-5 md:px-6">
          <Brand tone="nav" />
          <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
            <Link href="/jobs" className={TOP_LINK}>
              Jobs
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {isHr ? (
              <Button href="/hr/dashboard" variant="nav" size="sm">
                HR Dashboard
              </Button>
            ) : (
              <>
                <Button href="/login" variant="nav" size="sm">
                  Log in
                </Button>
                <Button href="/signup?role=candidate" size="sm">
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-hr px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
