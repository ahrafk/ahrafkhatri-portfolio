import { describe, expect, it } from "vitest";
import { INITIAL_CURSOR, PHASES, PHASE_MS, RAW_LINES, RECORDS, nextPhase, phaseAtLeast, phaseFromCursor } from "./frames";

describe("pipeline phases", () => {
  it("cycles raw, scan, parse, output, hold and back", () => {
    expect(PHASES.map((_, i) => nextPhase(PHASES[i]))).toEqual(["scan", "parse", "output", "hold", "raw"]);
  });
  it("orders phases for phaseAtLeast", () => {
    expect(phaseAtLeast("output", "parse")).toBe(true);
    expect(phaseAtLeast("hold", "output")).toBe(true);
    expect(phaseAtLeast("scan", "output")).toBe(false);
  });
  it("starts on the completed frame and wraps cleanly", () => {
    expect(phaseFromCursor(INITIAL_CURSOR)).toBe("hold");
    expect(phaseFromCursor(INITIAL_CURSOR + 1)).toBe("raw");
    expect(phaseFromCursor(INITIAL_CURSOR + 8)).toBe("parse");
    expect(phaseFromCursor(-1)).toBe("hold");
  });
  it("keeps a full cycle between 7 and 11 seconds", () => {
    const total = PHASES.reduce((sum, p) => sum + PHASE_MS[p], 0);
    expect(total).toBeGreaterThanOrEqual(7000);
    expect(total).toBeLessThanOrEqual(11000);
  });
});

describe("pipeline sample data", () => {
  it("has three well-formed records", () => {
    expect(RECORDS).toHaveLength(3);
    for (const r of RECORDS) {
      expect(r.title.length).toBeGreaterThan(3);
      expect(Number.isInteger(r.price_inr)).toBe(true);
      expect(Number.isInteger(r.area_sqft)).toBe(true);
    }
  });
  it("highlights at least one raw line", () => {
    expect(RAW_LINES.some((l) => l.hot)).toBe(true);
  });
});
