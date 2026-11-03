"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

// The 44px menu button on the slim purple bar, and the panel that slides down below it.
// Esc closes the panel and puts focus back on the button.
export default function MobileMenu({ children, className = "" }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const Icon = open ? X : Menu;
  return (
    <div className={className}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="grid size-touch place-items-center rounded-control text-nav-text transition-colors duration-(--duration-fast) ease-out hover:bg-nav-hover focus-visible:shadow-focus-nav focus-visible:outline-none"
      >
        <Icon className="size-icon-md" strokeWidth={1.75} aria-hidden="true" />
      </button>
      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-(--z-dropdown) flex animate-menu-in flex-col gap-0.5 border-t border-nav-line bg-nav-bg px-4 pt-3 pb-4 shadow-float"
        >
          {typeof children === "function" ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
}
