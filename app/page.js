import Link from "next/link";
import { BadgeCheck, Briefcase, Link as LinkIcon, Search, Sparkles } from "lucide-react";
import Brand from "@/components/ui/Brand";
import Button from "@/components/ui/Button";
import GradientMesh from "@/components/ui/GradientMesh";
import FadeUp from "@/components/motion/FadeUp";
import HeroVisual from "@/components/landing/HeroVisual";
import RotatingHeadline from "@/components/landing/RotatingHeadline";
import { DURATION } from "@/lib/motion";

// Landing page: a short intro with "I'm hiring" and "I'm looking for a job" (Feature 01).

// The landing motion spec staggers the hero by 90ms.
const HERO_STAGGER = DURATION.stagger * 1.5;

const STEPS = [
  { icon: Briefcase, title: "Post a job", text: "Add the title, skills, experience, degree and an optional Apply by date." },
  { icon: LinkIcon, title: "Share the link", text: "Candidates apply from any phone with a PDF CV." },
  {
    icon: Sparkles,
    title: "AI checks every CV",
    text: "Each CV gets a score out of 100, found and missing requirements, and the CV lines that prove them.",
  },
  { icon: BadgeCheck, title: "You decide", text: "Shortlist, interview and hire. AI never decides for you." },
];

export default function LandingPage() {
  return (
    <>
      <header className="relative overflow-hidden text-on-primary">
        <GradientMesh />
        <nav aria-label="Main" className="relative z-1 border-b border-glass-line">
          <div className="mx-auto flex h-nav max-w-hr items-center gap-3 px-4 sm:px-6">
            <Brand tone="gradient" />
            <Link
              href="#how"
              className="ml-auto hidden min-h-touch items-center rounded-control px-3 text-sm font-bold text-primary-faint no-underline hover:bg-glass focus-visible:shadow-focus-nav focus-visible:outline-none sm:inline-flex"
            >
              How it works
            </Link>
            <Button href="/login" variant="outline-dark" size="sm" className="ml-auto sm:ml-0">
              Log in
            </Button>
          </div>
        </nav>

        <div className="relative z-1 mx-auto grid max-w-hr items-center gap-12 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-24 lg:grid-cols-[1.15fr_1fr]">
          <div className="flex min-w-0 flex-col gap-6">
            <FadeUp distance={18} duration={DURATION.score}>
              <RotatingHeadline />
            </FadeUp>
            <FadeUp distance={18} duration={DURATION.score} delay={HERO_STAGGER}>
              <p className="body-lg max-w-130 text-primary-faint">
                Post a job, share one link, and let AI check every CV against your requirements, with a score,
                clear reasons and evidence from the CV. You make every decision.
              </p>
            </FadeUp>
            <FadeUp distance={18} duration={DURATION.score} delay={HERO_STAGGER * 2} className="flex flex-wrap gap-3">
              <Button href="/signup?role=hr" variant="on-dark" size="lg" icon={Briefcase}>
                I&apos;m hiring
              </Button>
              <Button href="/signup?role=candidate" variant="outline-dark" size="lg" icon={Search}>
                I&apos;m looking for a job
              </Button>
            </FadeUp>
          </div>
          <FadeUp distance={18} duration={DURATION.score} delay={HERO_STAGGER * 3} className="min-w-0">
            <HeroVisual />
          </FadeUp>
        </div>
      </header>

      <main>
        <section id="how" className="mx-auto max-w-hr px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto mb-12 flex max-w-160 flex-col items-center gap-3 text-center">
            <span className="caption text-primary uppercase">How it works</span>
            <h2 className="page-title">From job post to hire in four steps</h2>
            <p className="body-lg text-ink-muted">
              Built for HR teams who read hundreds of CVs and want to be fair to every one.
            </p>
          </div>
          <ol className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="flex flex-col gap-3">
                <span className="inline-grid size-12 place-items-center rounded-pill bg-primary-tint text-on-primary-tint">
                  <Icon className="size-icon-lg" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="text-[13px] font-extrabold text-primary tabular-nums">0{index + 1}</span>
                <h3 className="card-title">{title}</h3>
                <p className="text-ink-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-hr flex-col gap-3 px-4 py-12 sm:px-6">
          <Brand />
          <p className="max-w-130 text-ink-muted">
            AI-powered hiring for small and medium companies. AI screens and ranks CVs, HR makes every decision.
          </p>
          <p className="small text-ink-muted">© HireLens</p>
        </div>
      </footer>
    </>
  );
}
