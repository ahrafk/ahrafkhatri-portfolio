import type { CSSProperties } from "react";
import type { HeadlineSegment } from "@/content/hero";
import { cn } from "@/lib/cn";
import { splitHeadline } from "./split-headline";

/**
 * The page's single <h1>, rendered on the server. The word-by-word masked rise is a CSS animation
 * (`.hero-rise` in globals.css), so the text is in the first paint and needs no JavaScript to settle.
 */
export function HeroHeadline({ lines }: { lines: HeadlineSegment[][] }) {
  const split = splitHeadline(lines);
  return (
    <h1
      id="hero-title"
      className="mt-5 text-[clamp(2.5rem,6.2vw,4.4rem)] font-semibold leading-[1.04] tracking-[-0.035em]"
    >
      {split.map((words, lineIndex) => (
        <span key={lineIndex}>
          <span className="block">
            {words.map((word) => (
              <span key={word.index}>
                <span className="inline-block overflow-hidden pb-[0.14em] align-bottom">
                  <span
                    className={cn("hero-rise inline-block", word.accent && "text-accent")}
                    style={{ "--i": word.index } as CSSProperties}
                  >
                    {word.text}
                  </span>
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
