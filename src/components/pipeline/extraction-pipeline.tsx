"use client";

import { animate, m, useReducedMotion } from "motion/react";
import { CircleCheck, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { CHECKS, INITIAL_CURSOR, PHASE_MS, RAW_LINES, RECORDS, SAMPLE_TOTAL, phaseAtLeast, phaseFromCursor, type Phase } from "./frames";

const format = (n: number) => new Intl.NumberFormat("en-US").format(n);

const RAW_OPACITY: Record<Phase, number> = { raw: 1, scan: 1, parse: 0.55, output: 0.4, hold: 0.4 };

/** Advances an ever-increasing cursor on a timer; the phase is derived from it. */
function usePipelineCursor(running: boolean) {
  const [cursor, setCursor] = useState(INITIAL_CURSOR);
  useEffect(() => {
    if (!running) return;
    const delay = cursor === INITIAL_CURSOR ? 600 : PHASE_MS[phaseFromCursor(cursor)];
    const id = window.setTimeout(() => setCursor((c) => c + 1), delay);
    return () => window.clearTimeout(id);
  }, [cursor, running]);
  return cursor;
}

/** Shows the final total on the server; counts up whenever the output phase starts. */
function Counter({ active, reduced }: { active: boolean; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  // True while the server-rendered final total is what's on screen, so hydration doesn't replay the count-up.
  const showingTotal = useRef(active);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!active) {
      el.textContent = "0";
      showingTotal.current = false;
      return;
    }
    if (reduced || showingTotal.current) {
      el.textContent = format(SAMPLE_TOTAL);
      showingTotal.current = true;
      return;
    }
    showingTotal.current = true;
    const controls = animate(0, SAMPLE_TOTAL, {
      duration: 2.2,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = format(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [active, reduced]);
  return (
    <span ref={ref} className="tabular-nums">
      {format(SAMPLE_TOTAL)}
    </span>
  );
}

export function ExtractionPipeline() {
  const reduced = Boolean(useReducedMotion());
  const [paused, setPaused] = useState(false);
  const cursor = usePipelineCursor(!paused && !reduced);
  const phase: Phase = reduced ? "hold" : phaseFromCursor(cursor);
  const scanning = phase === "scan";
  const outputShown = phaseAtLeast(phase, "output");

  return (
    <div className="relative mx-auto w-full max-w-[560px]" data-phase={phase}>
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(closest-side,rgb(var(--glow)/0.22),transparent)] blur-2xl"
      />
      <div
        role="img"
        aria-label="Animated sample: raw HTML from a protected page is parsed into validated JSON records."
        className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-40px_rgb(var(--glow)/0.55)]"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2 font-mono text-xs text-muted">
            <span className="size-2 rounded-full bg-ok" />
            target-site.com/listings
          </div>
          <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">Sample run</span>
        </div>

        <div className="relative overflow-hidden border-b border-line bg-surface-2/60 px-4 py-3 font-mono text-[11px] leading-5">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-muted">Raw response</p>
          {RAW_LINES.map((line, i) => (
            <m.div
              key={i}
              initial={false}
              animate={{ opacity: RAW_OPACITY[phase] }}
              transition={{ duration: 0.3, delay: phase === "raw" ? i * 0.09 : 0 }}
              className={cn("overflow-hidden text-ellipsis whitespace-pre text-muted transition-colors duration-300", line.hot && phaseAtLeast(phase, "parse") && "text-accent")}
            >
              {line.text}
            </m.div>
          ))}
          <m.div
            aria-hidden
            initial={false}
            animate={scanning ? { y: ["-100%", "100%"], opacity: [0, 1, 1, 0] } : { y: "-100%", opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-x-0 top-0 h-full border-b border-accent bg-gradient-to-b from-transparent to-[rgb(var(--glow)/0.16)]"
          />
        </div>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-2.5 text-[11px]">
          {CHECKS.map((label, i) => {
            const done = phaseAtLeast(phase, "scan");
            return (
              <m.li
                key={label}
                initial={false}
                animate={{ opacity: done ? 1 : 0.35 }}
                transition={{ duration: 0.3, delay: phase === "scan" ? 0.25 + i * 0.3 : 0 }}
                className="flex items-center gap-1.5 text-muted"
              >
                <CircleCheck
                  className={cn("size-3.5 transition-colors duration-300", done ? "text-ok" : "text-muted")}
                  style={{ transitionDelay: phase === "scan" ? `${250 + i * 300}ms` : "0ms" }}
                  aria-hidden
                />
                {label}
              </m.li>
            );
          })}
        </ul>

        <div aria-hidden className="flex h-6 justify-center">
          <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
            <m.path
              d="M6 0V20M2 16l4 5 4-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
              initial={false}
              animate={{ pathLength: phaseAtLeast(phase, "parse") ? 1 : 0, opacity: phaseAtLeast(phase, "parse") ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
            />
          </svg>
        </div>

        <div className="min-h-[190px] px-4 pb-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">Structured output</p>
          <ul className="space-y-2" data-testid="pipeline-records">
            {RECORDS.map((r, i) => (
              <m.li
                key={r.title}
                initial={false}
                animate={outputShown ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.4, delay: phase === "output" ? i * 0.35 : 0, ease: EASE_OUT }}
                className="flex items-start justify-between gap-3 font-mono text-[11px] leading-5"
              >
                <span className="min-w-0 break-words">
                  <span className="text-muted">{"{ "}</span>
                  <span className="text-accent">&quot;title&quot;</span>
                  <span className="text-muted">: </span>
                  <span>&quot;{r.title}&quot;</span>
                  <span className="text-muted">, </span>
                  <span className="text-accent">&quot;price_inr&quot;</span>
                  <span className="text-muted">: </span>
                  <span>{r.price_inr}</span>
                  <span className="text-muted">, </span>
                  <span className="text-accent">&quot;area_sqft&quot;</span>
                  <span className="text-muted">: </span>
                  <span>{r.area_sqft}</span>
                  <span className="text-muted">{" }"}</span>
                </span>
                <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-ok" aria-hidden />
              </m.li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-line bg-surface-2/60 px-4 py-3 font-mono text-xs">
          <span className="text-muted">Records validated</span>
          <span className="text-fg">
            <Counter active={outputShown} reduced={reduced} />
          </span>
        </div>
      </div>

      {/* Always rendered so server and client markup match; the media query hides it (and drops it from the a11y tree) under reduced motion. */}
      <div className="mt-2 flex justify-end motion-reduce:hidden">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs text-muted transition-colors hover:text-fg"
        >
          {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
          Pause animation
        </button>
      </div>
    </div>
  );
}
