import Link from "next/link";
import { ScanSearch } from "lucide-react";

// HireLens brand mark: the scan-search glyph on a rounded square beside the name.
// tone "light" for light pages, "nav" for the deep purple bars, "gradient" for the purple art.
const TONES = {
  light: { text: "text-ink", mark: "bg-primary text-on-primary", focus: "focus-visible:shadow-focus" },
  nav: { text: "text-nav-text", mark: "bg-primary text-on-primary", focus: "focus-visible:shadow-focus-nav" },
  gradient: { text: "text-on-primary", mark: "bg-surface text-primary", focus: "focus-visible:shadow-focus-nav" },
};

export default function Brand({ tone = "light", href = "/" }) {
  const { text, mark, focus } = TONES[tone];
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center gap-2.5 rounded-control text-lg font-extrabold tracking-[-0.02em] no-underline focus-visible:outline-none ${text} ${focus}`}
    >
      <span className={`grid size-8 place-items-center rounded-control ${mark}`}>
        <ScanSearch className="size-4.5" strokeWidth={2.25} aria-hidden="true" />
      </span>
      HireLens
    </Link>
  );
}
