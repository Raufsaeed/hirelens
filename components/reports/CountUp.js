"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/lib/motion";

// A number that counts up from 0 when it first appears. With reduced motion it shows straight away.
// "4.0" is shown as "4"; "4.5" stays "4.5".
export default function CountUp({ value, decimals = 0 }) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(0, value, { duration: DURATION.score, ease: EASE_OUT, onUpdate: setShown });
    return () => controls.stop();
  }, [value, reduceMotion]);

  return Number(reduceMotion ? value : shown).toFixed(decimals).replace(/\.0+$/, "");
}
