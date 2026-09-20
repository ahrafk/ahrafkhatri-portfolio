import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";

/**
 * A landing-page section and the target of its nav anchor. `scroll-margin-top` here is the only anchor
 * offset on the page (`html` sets no `scroll-padding-top`), and it is negative on purpose: the section's
 * own top padding, 5rem and 7rem from `sm`, is already larger than the 4rem fixed header, so the offset
 * has to give some of that padding back. The values land the section's heading 2.5rem below the header
 * and still leave the eyebrow line above it clear of the header.
 */
export function Section({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("-scroll-mt-1 py-20 sm:-scroll-mt-9 sm:py-28", className)}>
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
