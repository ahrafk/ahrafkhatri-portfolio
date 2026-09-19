import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";

export function Section({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("scroll-mt-20 py-20 sm:py-28", className)}>
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
