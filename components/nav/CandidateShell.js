"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Brand from "@/components/ui/Brand";
import Avatar from "@/components/nav/Avatar";
import MobileMenu from "@/components/nav/MobileMenu";
import NavLinks from "@/components/nav/NavLinks";
import SignOutButton from "@/components/nav/SignOutButton";
import { SIDE_LINK, TOP_LINK } from "@/components/nav/navStyles";

// Avatar button that opens a small menu with Sign out (900px and wider).
function UserMenu({ fullName }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function close(event) {
      if (event.key === "Escape" || (event.type === "mousedown" && !menuRef.current?.contains(event.target))) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", close);
    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("mousedown", close);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="inline-flex min-h-touch items-center gap-2 rounded-pill border border-transparent pr-2 pl-1 text-sm font-bold text-nav-text transition-colors duration-(--duration-fast) ease-out hover:bg-nav-hover focus-visible:shadow-focus-nav focus-visible:outline-none"
      >
        <Avatar name={fullName} />
        <span className="max-w-40 truncate">{fullName}</span>
        <ChevronDown className="size-icon-sm" strokeWidth={1.75} aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-(--z-dropdown) mt-2 w-56 animate-fade-up rounded-control bg-nav-bg p-2 shadow-float">
          <NavLinks group="candidateAccount" linkClassName={SIDE_LINK} />
          <SignOutButton className={SIDE_LINK} />
        </div>
      )}
    </div>
  );
}

// Candidate layout: slim 56px deep purple top bar over the warm cream page.
// wide: public job pages use the wider HR content width instead of the candidate column.
export default function CandidateShell({ fullName, wide = false, children }) {
  return (
    <div className="min-h-dvh bg-surface-page">
      <header className="sticky top-0 z-(--z-nav) h-nav bg-nav-bg text-nav-text">
        <div className="relative mx-auto flex h-full max-w-hr items-center gap-3 px-4 md:gap-5 md:px-6">
          <Brand tone="nav" href="/jobs" />
          <nav aria-label="Main" className="hidden min-w-0 flex-1 items-center gap-1 overflow-hidden md:flex">
            <NavLinks group="candidate" linkClassName={TOP_LINK} />
          </nav>
          <div className="ml-auto hidden md:block">
            <UserMenu fullName={fullName} />
          </div>
          <MobileMenu className="ml-auto md:hidden">
            {(close) => (
              <>
                <NavLinks group="candidate" linkClassName={SIDE_LINK} onNavigate={close} />
                <hr className="my-1.5 h-px border-0 bg-nav-line" />
                <NavLinks group="candidateAccount" linkClassName={SIDE_LINK} onNavigate={close} />
                <SignOutButton className={SIDE_LINK} />
              </>
            )}
          </MobileMenu>
        </div>
      </header>
      <main className={`mx-auto w-full ${wide ? "max-w-hr" : "max-w-candidate"} px-4 py-6 sm:px-6 sm:py-10`}>
        {children}
      </main>
    </div>
  );
}
