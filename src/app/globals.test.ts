import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function tokens(selector: string): Record<string, string> {
  const block = css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]));
}

// [foreground token, background token]; every pair must meet WCAG AA for body text (4.5:1).
const pairs: [string, string][] = [
  ["fg", "bg"],
  ["fg", "surface"],
  ["muted", "bg"],
  ["muted", "surface"],
  ["muted", "surface-2"],
  ["accent", "bg"],
  ["accent", "surface"],
  ["accent-fg", "accent"],
  ["ok", "bg"],
  ["ok", "surface"],
  ["danger", "bg"],
  ["danger", "surface"],
];

describe.each([
  ["light", ":root"],
  ["dark", "\\.dark"],
])("%s theme tokens", (_name, selector) => {
  const t = tokens(selector);

  it("defines every token the components rely on", () => {
    for (const key of ["bg", "surface", "surface-2", "border", "fg", "muted", "accent", "accent-fg", "ok", "danger"]) {
      expect(t[key], `--${key}`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it.each(pairs)("%s on %s meets WCAG AA (4.5:1)", (fg, bg) => {
    expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });
});
