"use client";

import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { capabilities } from "@/content/capabilities";
import { sectionCopy } from "@/content/sections";

function Pill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-fg">
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

/** Concrete capabilities in a slow loop. Pausable, and a static wrapped list under reduced motion. */
export function CapabilitiesMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <section aria-label="Capabilities" className="border-y border-line bg-surface/40">
      <Container className="flex items-center gap-4 py-5 sm:gap-8">
        <p className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-muted sm:block">
          {sectionCopy.capabilities.label}
        </p>
        <div
          className="marquee relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
          data-paused={paused}
        >
          <ul role="list" className="marquee-track flex">
            {capabilities.map((c) => (
              <li key={c} className="shrink-0 pr-3">
                <Pill>{c}</Pill>
              </li>
            ))}
            {capabilities.map((c) => (
              <li key={`${c}-dup`} aria-hidden className="marquee-dup shrink-0 pr-3">
                <Pill>{c}</Pill>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label="Pause capabilities scroll"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-fg motion-reduce:hidden"
        >
          {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
        </button>
      </Container>
    </section>
  );
}
