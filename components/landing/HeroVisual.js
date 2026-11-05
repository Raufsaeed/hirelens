"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import MatchBar from "@/components/candidates/MatchBar";
import ScoreRing from "@/components/candidates/ScoreRing";
import { DURATION } from "@/lib/motion";

// Landing hero visual, built from the app's own components with dummy data (Ayesha Malik is not a
// real person). Two cards overlap at slight angles and float gently at different speeds over a large,
// faint owl. Reduced motion: the cards stay still. Decorative, so screen readers skip it.

function Floating({ seconds, distance, className, children }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      animate={reduceMotion ? undefined : { y: [0, -distance, 0] }}
      transition={reduceMotion ? undefined : { duration: seconds, ease: "easeInOut", repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}

export default function HeroVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto flex w-full max-w-100 flex-col py-6 lg:block lg:aspect-square lg:max-w-120 lg:py-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG logo, decorative */}
      <img src="/logo-mark.svg" alt="" className="absolute inset-0 m-auto w-full opacity-[0.08]" />

      <Floating seconds={DURATION.float} distance={10} className="relative z-1 w-[94%] lg:absolute lg:top-[8%] lg:left-0 lg:w-[78%]">
        <div className="flex -rotate-3 flex-col gap-4 rounded-dialog bg-surface p-5 text-ink shadow-float">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="card-title">Ayesha Malik</span>
              <span className="small text-ink-muted">Junior Web Developer</span>
            </div>
            <ApplicationStatusBadge status="shortlisted" />
          </div>
          <div className="flex items-center gap-4">
            <div className="origin-left scale-75 lg:scale-90">
              <ScoreRing score={88} size="lg" />
            </div>
            <div className="-ml-8 flex min-w-0 flex-1 flex-col gap-2 lg:-ml-4">
              <span className="label text-ink-muted">Requirements match</span>
              <MatchBar percent={80} />
            </div>
          </div>
        </div>
      </Floating>

      <Floating seconds={DURATION.floatFast} distance={8} className="relative z-2 -mt-5 ml-auto w-[80%] lg:absolute lg:right-0 lg:bottom-[6%] lg:mt-0 lg:w-[64%]">
        <div className="flex rotate-2 items-start gap-3 rounded-card bg-surface p-4 text-ink shadow-float">
          <span className="grid size-9 shrink-0 place-items-center rounded-pill bg-success-bg text-success">
            <CircleCheck className="size-icon-md" strokeWidth={1.75} />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="font-bold">AI found React in the CV</span>
            <span className="small text-ink-muted">&ldquo;Built 3 dashboards in React and Next.js&rdquo;</span>
          </div>
        </div>
      </Floating>
    </div>
  );
}
