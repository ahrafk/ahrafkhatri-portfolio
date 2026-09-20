"use client";

import * as m from "motion/react-m";
import { EASE_OUT } from "@/components/ui/reveal";

const view = { once: true, margin: "0px 0px -10% 0px" } as const;

/**
 * Stages as boxes joined by connectors that draw in. Vertical on phones, horizontal from md up.
 * From md the row stretches so every box is the height of the tallest label; the `li` keeps
 * `items-center` so the connector between two boxes stays on their shared centre line.
 */
export function ArchitectureDiagram({ stages }: { stages: string[] }) {
  return (
    <ol role="list" aria-label="Pipeline stages" className="flex flex-col items-stretch md:flex-row">
      {stages.map((stage, i) => (
        <li key={stage} className="flex flex-col items-center md:flex-1 md:flex-row">
          <m.div
            data-reveal
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={view}
            transition={{ duration: 0.5, delay: i * 0.12, ease: EASE_OUT }}
            className="w-full rounded-xl border border-line bg-surface px-4 py-4 text-center text-sm font-medium md:min-h-[88px] md:flex-1 md:content-center md:self-stretch"
          >
            <span aria-hidden className="mb-1 block font-mono text-[10px] text-accent">{String(i + 1).padStart(2, "0")}</span>
            {stage}
          </m.div>
          {i < stages.length - 1 ? (
            <>
              <m.span
                aria-hidden
                data-reveal
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={view}
                transition={{ duration: 0.4, delay: i * 0.12 + 0.2, ease: EASE_OUT }}
                className="block h-6 w-px origin-top bg-accent md:hidden"
              />
              <m.span
                aria-hidden
                data-reveal
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={view}
                transition={{ duration: 0.4, delay: i * 0.12 + 0.2, ease: EASE_OUT }}
                className="hidden h-px w-6 origin-left bg-accent md:block"
              />
            </>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
