import Link from "next/link";

// HireLens brand: the owl mark (public/logo-mark.svg) and the "HireLens" wordmark in Manrope 800,
// with "Lens" in the logo gradient (design/design-guidelines.md, Logo).
// tone "light" for light pages, "nav" for the deep purple bars, "gradient" for the purple art.
// layout "inline" (mark beside the name) or "stacked" (auth pages: mark above, with the tagline).
const TONES = {
  light: {
    text: "text-ink",
    lens: "from-logo-lens-light-from to-logo-lens-light-to",
    tagline: "text-ink-muted",
    focus: "focus-visible:shadow-focus",
  },
  nav: {
    text: "text-nav-text",
    lens: "from-logo-lens-dark-from to-logo-lens-dark-to",
    tagline: "text-nav-text-muted",
    focus: "focus-visible:shadow-focus-nav",
  },
  gradient: {
    text: "text-on-primary",
    lens: "from-logo-lens-dark-from to-logo-lens-dark-to",
    tagline: "text-primary-faint",
    focus: "focus-visible:shadow-focus-nav",
  },
};

function Wordmark({ text, lens, className }) {
  return (
    <span className={`font-extrabold tracking-[-0.02em] ${text} ${className}`}>
      Hire<span className={`bg-linear-to-r bg-clip-text text-transparent ${lens}`}>Lens</span>
    </span>
  );
}

export default function Brand({ tone = "light", href = "/", layout = "inline" }) {
  const { text, lens, tagline, focus } = TONES[tone];
  const linkClasses = `shrink-0 rounded-control no-underline focus-visible:outline-none ${focus}`;

  if (layout === "stacked") {
    return (
      <Link href={href} aria-label="HireLens home" className={`inline-flex flex-col items-center gap-2 text-center ${linkClasses}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG logo */}
        <img src="/logo-mark.svg" alt="" width={64} height={64} className="size-16" />
        <Wordmark text={text} lens={lens} className="text-2xl" />
        <span className={`caption tracking-[0.2em] uppercase ${tagline}`}>AI-powered hiring</span>
      </Link>
    );
  }

  return (
    <Link href={href} className={`inline-flex items-center gap-2.5 ${linkClasses}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG logo */}
      <img src="/logo-mark.svg" alt="" width={32} height={32} className="size-8" />
      <Wordmark text={text} lens={lens} className="text-lg" />
    </Link>
  );
}
