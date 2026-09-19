"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type Props = { children: ReactNode; delay?: number; y?: number; className?: string };

/** Fades and lifts its children into view once. `data-reveal` lets the noscript style keep it visible without JS. */
export function Reveal({ children, delay = 0, y = 18, className }: Props) {
  return (
    <m.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
    >
      {children}
    </m.div>
  );
}
