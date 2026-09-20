"use client";

import * as m from "motion/react-m";
import { EASE_OUT } from "@/components/ui/reveal";
import type { HeadlineSegment } from "@/content/hero";
import { cn } from "@/lib/cn";
import { splitHeadline } from "./split-headline";

/** The page's single <h1>, revealed word by word. Text stays in the server HTML; `data-reveal` keeps it visible without JS. */
export function HeroHeadline({ lines }: { lines: HeadlineSegment[][] }) {
  const split = splitHeadline(lines);
  return (
    <h1 id="hero-title" className="mt-5 text-balance text-[clamp(2.5rem,6.2vw,4.4rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
      {split.map((words, lineIndex) => (
        <span key={lineIndex}>
          <span className="block">
            {words.map((word) => (
              <span key={word.index}>
                <span className="inline-block overflow-hidden pb-[0.14em] align-bottom">
                  <m.span
                    data-reveal
                    className={cn("inline-block", word.accent && "text-accent")}
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 + word.index * 0.08, ease: EASE_OUT }}
                  >
                    {word.text}
                  </m.span>
                </span>
                {word.last ? null : " "}
              </span>
            ))}
          </span>
          {lineIndex < split.length - 1 ? " " : null}
        </span>
      ))}
    </h1>
  );
}
