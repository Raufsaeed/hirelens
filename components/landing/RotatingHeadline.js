"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/lib/motion";

// Landing headline: "Hire faster." then a second line that slides up to the next phrase every 2.5s.
// Every phrase sits invisibly in the same spot, so the box is always as tall as the longest one and
// nothing below it jumps. Screen readers read one static sentence. Reduced motion: "Hire fairly." only.

const PHRASES = ["Hire fairly.", "Hire smarter.", "Hire with evidence."];
const ROTATE_MS = 2500;

export default function RotatingHeadline() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % PHRASES.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return (
    <h1 className="display text-on-primary">
      <span className="sr-only">Hire faster. Hire fairly.</span>
      <span aria-hidden="true" className="block">
        Hire faster.
      </span>
      <span aria-hidden="true" className="relative grid overflow-hidden">
        {PHRASES.map((phrase) => (
          <span key={phrase} className="invisible col-start-1 row-start-1">
            {phrase}
          </span>
        ))}
        <AnimatePresence initial={false}>
          <motion.span
            key={reduceMotion ? 0 : index}
            className="absolute inset-x-0 top-0"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: DURATION.slow, ease: EASE_OUT }}
          >
            {PHRASES[reduceMotion ? 0 : index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}
