"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/lib/motion";

// Fades content in while it rises a little. With reduced motion it only fades.
// distance: 8 for page content, 18 for landing and auth cards (from the motion rules).
export default function FadeUp({ children, distance = 8, delay = 0, duration = DURATION.base, className }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay: reduceMotion ? 0 : delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
