import type { HeadlineSegment } from "@/content/hero";

export type HeadlineWord = { text: string; accent: boolean; index: number; last: boolean };

/** Flattens headline lines into words, numbering them across lines so entrance delays can stagger. */
export function splitHeadline(lines: readonly (readonly HeadlineSegment[])[]): HeadlineWord[][] {
  let index = 0;
  return lines.map((segments) => {
    const words = segments.flatMap((segment) =>
      segment.text
        .split(" ")
        .filter(Boolean)
        .map((text) => ({ text, accent: Boolean(segment.accent) })),
    );
    return words.map((word, i) => ({ ...word, index: index++, last: i === words.length - 1 }));
  });
}
