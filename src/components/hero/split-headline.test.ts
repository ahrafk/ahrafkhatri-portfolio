import { describe, expect, it } from "vitest";
import { hero } from "@/content/hero";
import { splitHeadline } from "./split-headline";

describe("splitHeadline", () => {
  const lines = splitHeadline(hero.headline);
  const flat = lines.flat();

  it("splits the headline into words in reading order", () => {
    expect(flat.map((w) => w.text)).toEqual(["Turn", "Difficult", "Websites", "Into", "Reliable", "Data."]);
  });
  it("numbers words contiguously from 0", () => {
    expect(flat.map((w) => w.index)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it("carries the accent flag only on the accented words", () => {
    expect(flat.filter((w) => w.accent).map((w) => w.text)).toEqual(["Reliable", "Data."]);
  });
  it("marks the final word of each line", () => {
    // The headline is authored as three intentional lines: "Turn Difficult" / "Websites Into" / "Reliable Data."
    expect(lines.map((l) => l.filter((w) => w.last).map((w) => w.text))).toEqual([["Difficult"], ["Into"], ["Data."]]);
  });
});
