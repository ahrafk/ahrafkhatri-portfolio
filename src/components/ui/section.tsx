import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";

/**
 * A landing-page section and the target of its nav anchor.
 *
 * Two coupled values decide where an anchor lands, and they add together:
 *   `html { scroll-padding-top: 4rem }` in globals.css, which matches the fixed header and is what
 *   keeps focus clear of it, and the `scroll-margin-top` below. The section's top edge lands at
 *   `4rem + scroll-margin-top`, so -4.25rem puts it at -0.25rem and -6.25rem (from `sm`) at -2.25rem.
 * The margin is negative because the section's own top padding, 5rem and 7rem from `sm`, is already
 * larger than the header, so the offset has to give part of that padding back. Change one of the two
 * values and the other has to move by the same amount or the landing position shifts.
 *
 * The result: the eyebrow line clears the header and the heading sits 40px below it -- except in
 * Services, where `SectionHeading`'s `lg:items-end` pushes the heading block 16px further down.
 */
export function Section({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("-scroll-mt-17 py-20 sm:-scroll-mt-25 sm:py-28", className)}>
      {children}
    </section>
  );
}

type HeadingProps = { id: string; eyebrow: string; title: string; intro?: string; className?: string };

export function SectionHeading({ id, eyebrow, title, intro, className }: HeadingProps) {
  return (
    <div className={cn("mb-12 grid gap-6 lg:mb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end", className)}>
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        <h2 id={`${id}-title`} className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          {title}
        </h2>
      </Reveal>
      {intro ? (
        <Reveal delay={0.08}>
          <p className="text-pretty text-base text-muted sm:text-lg">{intro}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
