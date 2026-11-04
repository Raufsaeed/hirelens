"use client";

import Brand from "@/components/ui/Brand";
import CandidateSearch from "@/components/candidates/CandidateSearch";
import Avatar from "@/components/nav/Avatar";
import MobileMenu from "@/components/nav/MobileMenu";
import NavLinks from "@/components/nav/NavLinks";
import SignOutButton from "@/components/nav/SignOutButton";
import { SIDE_LINK } from "@/components/nav/navStyles";

// HR layout: 248px deep purple sidebar on wide screens; below 900px a 56px purple bar with a menu.
export default function HrShell({ fullName, companyName, children }) {
  return (
    <div className="min-h-dvh bg-surface-page md:grid md:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]">
      {/* Sidebar (900px and wider) */}
      <aside className="sticky top-0 z-(--z-nav) hidden h-dvh flex-col gap-6 overflow-y-auto bg-nav-bg px-4 py-5 text-nav-text md:flex">
        <div className="flex flex-col gap-3 px-2 py-1">
          <Brand tone="nav" href="/hr/dashboard" />
          <span className="caption text-nav-text-muted uppercase">{companyName}</span>
        </div>
        <nav aria-label="HR" className="flex flex-col gap-1">
          <NavLinks group="hr" linkClassName={SIDE_LINK} />
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-nav-line pt-4">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <Avatar name={fullName} />
            <div className="min-w-0">
              <strong className="block truncate text-sm leading-5 text-nav-text">{fullName}</strong>
              <span className="text-[13px] leading-[18px] text-nav-text-muted">HR</span>
            </div>
          </div>
          <NavLinks group="hrAccount" linkClassName={SIDE_LINK} />
          <SignOutButton className={SIDE_LINK} />
        </div>
      </aside>

      {/* Slim top bar (below 900px) */}
      <header className="sticky top-0 z-(--z-nav) flex h-nav items-center justify-between gap-3 bg-nav-bg px-4 md:hidden">
        <Brand tone="nav" href="/hr/dashboard" />
        <MobileMenu>
          {(close) => (
            <>
              <span className="caption px-3 py-2 text-nav-text-muted uppercase">{companyName}</span>
              <NavLinks group="hr" linkClassName={SIDE_LINK} onNavigate={close} />
              <hr className="my-1.5 h-px border-0 bg-nav-line" />
              <NavLinks group="hrAccount" linkClassName={SIDE_LINK} onNavigate={close} />
              <SignOutButton className={SIDE_LINK} />
            </>
          )}
        </MobileMenu>
      </header>

      <div className="min-w-0">
        {/* HR content top bar with Candidate Search (Feature 13), on every HR page. */}
        <div className="z-(--z-dropdown) flex h-topbar items-center gap-4 border-b border-border bg-surface-page px-4 md:sticky md:top-0 md:px-8">
          <CandidateSearch />
        </div>
        <main>
          <div className="w-full max-w-[calc(var(--width-hr)+2*var(--space-8))] px-4 py-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
