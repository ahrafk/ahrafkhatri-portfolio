import { describe, expect, it } from "vitest";
import { pickActiveSection } from "./use-active-section";

const order = ["about", "services", "case-studies", "faq"];

describe("pickActiveSection", () => {
  it("returns null when nothing intersects", () => {
    expect(pickActiveSection(new Set(), order)).toBeNull();
  });
  it("returns the only intersecting section", () => {
    expect(pickActiveSection(new Set(["services"]), order)).toBe("services");
  });
  it("prefers the later section in page order when two intersect", () => {
    expect(pickActiveSection(new Set(["services", "case-studies"]), order)).toBe("case-studies");
  });
  it("ignores ids that are not in the order list", () => {
    expect(pickActiveSection(new Set(["hero"]), order)).toBeNull();
  });
});
